# Architecture

This file defines the contracts the Rust core and the IPC surface must satisfy. [DESIGN.md#8](../DESIGN.md#8-里程碑与验收标准) owns which milestone delivers them; [providers.md](providers.md), [config-schema.md](config-schema.md), and [execution-safety.md](execution-safety.md) own the detail.

## Layering

```
UI (React)            renders state, collects selection, calls commands
  │  invoke / listen  — src/ipc is the only place a command or event name appears
IPC (src/commands)    validate input, call core, return a typed result | emit progress
Core (src/core)       config → scan → plan → exec → verify → clean → history
  │
Platform (src/platform)  the only code that touches Win32, WinReg, HTTP, or the process table
```

Three rules hold the layering:

1. A mutating operation is always `plan` then `execute`. `plan` is pure: it reads state and returns what it would do, including bytes to be freed, elevation need, proxy need, and processes that must be closed. `execute` takes that plan and performs it; it never re-plans, and it never widens the plan it was given.
2. `src/platform/` is the only module with `unsafe` or direct OS calls. A provider asks platform for a probe result, a spawned child, or an elevation, and stays testable on a machine where nothing is installed.
3. A provider knows one application form and nothing else. It gets its parameters from its `config/apps.yaml` entry, not from its own hardcoded table.

## Stages

| Stage | Owns | Entry → exit |
|---|---|---|
| `config` | Loading and merging `apps.yaml`, resolving `%VAR%` paths, validating field combinations | file → `Registry { settings, apps }` |
| `scan` | Running every enabled provider's `detect` and `latest` under its own timeout, with failure isolation and a concurrency limit. Invoked only by the user's own `scan` call | registry → `Vec<AppState>` + `scan://progress` per provider |
| `plan` | Deciding per app: needs update, needs elevation, needs proxy, needs the target closed, may be cleaned; assembling a `Plan` with a stable id | `AppState[]` + registry → `Plan` |
| `exec` | Spawning children: per-child proxy env, `Stdio::null()` stdin, ANSI-stripped output streamed to the run log and to `update://progress`, timeout and process-tree cancellation | `Plan` → `Outcome[]` |
| `verify` | Asserting the version changed (or a hash matched the expected asset) and recording `from` → `to` | `Outcome` → verified `Outcome` |
| `clean` | Matching cleanup rules to a byte accounting, then deleting exactly the matched entries after a preview; `clean://progress` per rule | rules + `dry_run: false` → `CleanReport` |
| `history` | Appending one JSONL record per action, updating `state.json`, writing the run log | any outcome → durable record |

`scan` never mutates anything. That is what makes M1's acceptance criterion — twelve applications reporting versions with a file-hash self-proof that nothing on disk changed — a testable claim rather than a promise.

### scan

`scan` runs only when the `scan` command is invoked. Nothing triggers it implicitly — not the window lifecycle, not a focus change, not a timer, and not another stage. Launching the application reads `state.json` and renders it; a machine that has never scanned shows an empty list and a prompt.

Every provider is independent: its own `tokio::time::timeout`, its own error slot. A failure marks that row `failed` with a reason and leaves every other row untouched. Concurrency defaults to `settings.concurrency` and applies to providers, not to applications, so a slow registry never blocks the local probes.

Results are written to `state.json` with `checked_at`. That cache exists to render a previous result and its age — the UI never re-probes on focus, and no stage reads it to decide *whether* to update: that decision comes from the versions the current run observed.

A single-row refresh is the same command with `apps: [<id>]`: one provider runs, the other rows keep their recorded values and `checked_at`.

### plan

`Plan` is the only input to `exec`, and it is serializable and printable — the UI shows exactly what a batch will do before it starts. A `Plan` records, per app: target version, elevation requirement, proxy requirement, processes to close, whether a rollback copy is taken, and the estimated download size when the source reports one.

### exec

Execution is the layer [execution-safety.md](execution-safety.md) governs. It owns the child environment (proxy injected per child), never leaves a child attached to a TTY, enforces the per-provider timeout, and on cancellation kills the whole process tree. Its output contract is a byte stream plus a terminal `Outcome { result, exit_code, duration_ms, log_path }`.

### verify

An update is successful only when verification passes: the detected version differs from the recorded `from`, or the provider asserts an expected hash for a downloaded asset. Verification failure keeps the previous version's record, marks the app `verify_failed`, and keeps the rollback copy when one exists.

### clean

Cleanup is a separate pipeline from update and runs against rule matches rather than applications. The three hard rules and the `Rule` semantics live in [cleanup-rules.md](cleanup-rules.md); the field reference is in [config-schema.md](config-schema.md#cleanup-rule-fields).

### history

Append-only, one record per action:

```json
{ "ts": "2026-09-17T10:04:11Z", "app_id": "omp", "action": "update",
  "from": "18.2.3", "to": "18.2.4", "result": "ok", "duration_ms": 38400,
  "exit_code": 0, "log_path": "logs/omp-20260917T100332.log" }
```

`action` is one of `scan`, `update`, `clean`, `elevate`, `rollback`; `result` is `ok`, `failed`, `skipped`, or `cancelled`. A record is appended after the operation settles, so a crashed run leaves evidence of reaching a state, never a claim of completing one.

## Module ownership

| Path | Owns |
|---|---|
| `src-tauri/src/commands/` | The `#[tauri::command]` surface: argument validation, event emission, result mapping. No logic that a Rust test cannot reach without Tauri |
| `src-tauri/src/core/` | The seven stages above, the error type, and the state machine between stages |
| `src-tauri/src/providers/` | One file per form; `mod.rs` holds the trait, the form enum, and the registry |
| `src-tauri/src/platform/` | Proxy resolution from the registry, HTTP client construction, process enumeration and termination, elevation, exe version reading, ANSI stripping |
| `src-tauri/src/state/` | Path resolution under `%LOCALAPPDATA%\Upkeep`, the JSONL appender, the atomic `state.json` writer, log file naming |

## IPC surface

Command arguments and results are documented once here and mirrored in `src/ipc/`; the Rust side owns the serde representation. Every mutating command takes an explicit `dry_run` flag or a `Plan` id, and returns the run id that correlates it with the history record and the log file.

| Command | Input | Result |
|---|---|---|
| `scan` | `{ apps?: string[] }` | `ScanReport { checked_at, apps: AppState[] }` |
| `plan_update` | `{ apps: string[] }` | `Plan { id, steps: PlanStep[] }` |
| `run_update` | `{ plan_id }` | `RunReport { run_id, outcomes: Outcome[] }` |
| `plan_clean` | `{ rules?: string[], apps?: string[] }` | `CleanPlan { id, rules: RuleMatch[] }` |
| `run_clean` | `{ plan_id, confirmed_paths }` | `CleanReport { run_id, freed_bytes, removed: string[] }` |
| `rollback` | `{ app_id, to }` | `Outcome` |
| `history` | `{ limit?, app_id? }` | `HistoryRecord[]` |
| `read_log` | `{ run_id }` | `{ path, tail }` |
| `settings` / `set_settings` | `Settings` / partial | `Settings` |
| `open_external` | `{ target }` | `()` |
| `cancel_run` | `{ run_id }` | `()` |

Events, all emitted at most once per completed unit of work:

| Event | Payload |
|---|---|
| `scan://progress` | `{ app_id, state, error? }` |
| `update://progress` | `{ run_id, app_id, phase, percent?, bytes_per_s?, eta_s?, line? }` |
| `clean://progress` | `{ plan_id, rule, matched, bytes, removed }` |
| `run://settled` | `{ run_id, result }` |

`phase` is one of `prepare`, `download`, `install`, `verify`, `done`.

## Extension points

- **A new application form** → a provider file, the trait impl, a `form` value, and a `config/apps.yaml` entry. Follow [adding-a-provider.md](cookbook/adding-a-provider.md).
- **A new version source** → a `latest.kind` variant in `core/`, implemented once for every form that declares it. Sources are form-independent by design: `github`, `npm`, `choco`, and `file-version` are shared.
- **A new cleanup target** → a rule in `apps.yaml` when an existing provider's rules can express it; a provider `cleanup_rules()` addition only when matching needs knowledge the declarative schema cannot carry. Follow [adding-a-cleanup-rule.md](cookbook/adding-a-cleanup-rule.md).
- **A new install/uninstall preview** → a UI feature directory plus commands; no core stage change.

## On-disk artifacts

| Path | Written by | Notes |
|---|---|---|
| `%LOCALAPPDATA%\Upkeep\state.json` | `state` | Atomic replace; cache of last-known versions and `checked_at` |
| `%LOCALAPPDATA%\Upkeep\history.jsonl` | `state` | Append-only; never rewritten, never compacted in place |
| `%LOCALAPPDATA%\Upkeep\logs\<app_id>-<run>.log` | `exec` | ANSI-free; the file a red row opens |
| `%LOCALAPPDATA%\Upkeep\rollback\<app_id>\<version>\` | `exec` | Present only for forms whose [rollback strategy](providers.md#rollback-and-retention) keeps a copy |
| `%LOCALAPPDATA%\Upkeep\apps.yaml` | user | Optional override of the shipped default; merged per app id |
