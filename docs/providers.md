# Providers

A provider is one update *mechanism*, not one application. Adding an application is a `config/apps.yaml` change; adding an ecosystem is one row in the [manager table](#managers); writing a provider file is reserved for a genuinely new mechanism. Each provider is parameterized by the app entry that selects it, and `core/` never branches on the form. To add an application, follow [adding-a-provider.md](cookbook/adding-a-provider.md).

## The trait

```rust
#[async_trait]
pub trait Provider: Send + Sync {
    fn id(&self) -> &str;
    fn form(&self) -> Form;                                     // the mechanism
    async fn detect(&self, ctx: &Ctx) -> Result<Installed>;      // current version
    async fn latest(&self, ctx: &Ctx) -> Result<Option<String>>; // newest known version
    fn plan(&self, i: &Installed, l: &Option<String>) -> Plan;   // update? elevate? proxy? close? back up?
    async fn update(&self, ctx: &Ctx, p: &Plan) -> Result<Outcome>;
    fn cleanup_rules(&self) -> Vec<Rule>;
    fn rollback(&self, ctx: &Ctx, to: &str) -> Result<Outcome> {
        Err(Error::Unsupported)
    }
}
```

### Method contracts

- `id` / `form` are pure and constant; they never depend on `Ctx`, so the registry is built before any probe runs.
- `detect` returns the installed version plus the resolved executable path. It reads the tool's own answer — a version command, a manager listing, or the executable's version resource — and never guesses from a directory name. A missing executable or package is `Error::NotInstalled`, which renders as an absent row rather than a failure.
- `latest` walks the app's [source chain](#version-sources) in order and returns the first usable answer; `None` means no source answered, never a guess. A `# TBD` source returns `None` with `Error::SourceUnverified`, which the UI shows as `unknown`.
- `plan` is pure and synchronous: no I/O, no spawning. It returns what would happen — target version, rollback copy, elevation, proxy, processes to close — so the UI can show the plan before anything runs.
- `update` performs exactly the plan it was given and may not raise privilege, change the version, or start a second child.
- `cleanup_rules` returns the rules this app's entry declares, with the installed version available to `keep_matching_version`.
- `rollback` restores a previous version where the mechanism allows it and reports `Error::Unsupported` otherwise, which the UI reads as "reinstall to roll back".

A provider never writes history or state, never formats UI text, and never calls Win32 or the registry directly: it asks `src/platform/` for a probe, a child, or an elevation. That keeps every provider testable with a fake platform.

## The five mechanisms

| Mechanism | Covers | Cost of a new app |
|---|---|---|
| `manager` | A package or ecosystem manager drives detect, latest, and update: winget, npm, pnpm, bun, yarn, scoop, choco, pip, pipx, uv, dotnet tool, cargo, go install | Config entry; a new *manager* is one table row |
| `self-update-cli` | A tool with its own update command (`omp update`, `pi update self`) | Config entry |
| `external-ui` | A desktop application that updates itself: detect, badge, open app or release page — never driven by Upkeep | Config entry |
| `green` | A portable application with no updater: detect and offer the download page | Config entry |
| `declarative` | **Anything else**, expressed entirely in config: a detect command and regex, a source chain, an update command and arguments, verification, cleanup | Config entry, no code |

A tool whose update path is interactive is not eligible for `manager`, `self-update-cli`, or `declarative`; it belongs in `external-ui` or `green`, where Upkeep only reports.

## Managers

Form `manager` reads one table row per manager (`src-tauri/src/providers/managers.rs`). A row declares the listing command and its parser, the upgrade command template, the id field it reads from the app entry, whether it needs elevation, whether it needs the proxy injected, and its non-interactive flags.

| Manager | State here | Listing (detect) | Upgrade | Elevation | Proxy |
|---|---|---|---|---|---|
| `winget` | ✓ 1.29.290 | `winget list` / `winget upgrade` | `winget upgrade --id <id>` | sometimes | reads the system proxy itself — **inject nothing** |
| `npm` | ✓ 12.0.0 | `npm ls -g --json` | `npm i -g <pkg>@latest` | no | inject |
| `choco` | ✓ 2.2.2 | `choco outdated --limit-output` | `choco upgrade <pkg> -y` | yes (UAC) | inject |
| `uv` | ✓ 0.11.7 | `uv tool list` | `uv tool upgrade <name>` | no | inject |
| `dotnet` | ✓ 10.0.204 | `dotnet tool list -g` | `dotnet tool update -g <id>` | no | inject |
| `pip` | ✓ 26.1.1 | `python -m pip list --outdated --format=json` | `python -m pip install -U <pkg>` | no | inject |
| `go` | ✓ 1.24.5 | `go version` for the toolchain; installed binaries have no manifest | `go install <module>@latest` | no | inject |
| `pnpm` | ✓ 11.9.0 | `pnpm ls -g` fails here until its global bin is on `PATH` (measured) | `pnpm add -g <pkg>@latest` | no | inject |
| `scoop`, `pipx`, `bun`, `yarn`, `cargo`, `nuget` | not installed | their documented listing command | their documented upgrade command | — | — |

A manager row for a manager that is not installed here is written together with the first application that needs it, and its commands are verified by running them at that point — the table does not carry a command nobody has executed ([rule](../AGENTS.md)).

Two manager-wide rules: a listing call is shared across every app of that manager in one scan (one `winget upgrade`, one `choco outdated`), and `winget` is always resolved as `%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe`, because it is an execution alias that `PATH` and `cmd` do not resolve.

## The declarative mechanism

`form: declarative` carries the whole behaviour in the app entry — the universal escape hatch for a tool that has a command line but no manager and no built-in updater:

```yaml
- id: my-tool
  form: declarative
  detect: { command: "my-tool", args: ["version"], regex: "v?([\\d.]+)" }
  latest:
    - { kind: url_regex, url: "https://example.com/download", regex: "my-tool-([\\d.]+)\\.zip" }
  update: { command: "my-tool", args: ["self-update"], needs_proxy: true }
  verify: { expect: changed }
```

It gets everything the built-in mechanisms get: the proxy injected per child, `stdin` null, ANSI stripping, its own timeout, elevation through the helper, a rollback copy when `retention: auto` applies, `verify`, and the same cleanup rules. The fields are in [config-schema.md](config-schema.md#update).

## Version sources

| `kind` | Where the version comes from | Measured here |
|---|---|---|
| `winget` | `winget upgrade` for every winget-managed app in one call | ✓ 83 upgradeable |
| `manager` | The manager's own listing call, shared with detect | ✓ |
| `github` | `GET /repos/{repo}/releases/latest` → `tag_name`, through the resolved proxy | ✓ PiDeck `v0.7.6` |
| `npm` | `registry.npmjs.org/<pkg>/latest` → `version` | ✓ 26 packages |
| `self-check` | The tool's own `update --check` | ✓ `omp update --check` exists |
| `choco` | `choco outdated --limit-output`, one call for every choco app | ✓ 9 pending |
| `file-version` | The executable's `VS_VERSION_INFO` | ✓ used for PiDeck, CC Switch, Clash Verge, BCompare, Apifox |
| `url_regex` | A release or download page, group 1 is the version | fallback only |

`latest` takes one source or an **ordered chain**; a single mapping is sugar for a one-element chain, and the first source that answers wins. The chain is what makes an app manageable without knowing which mechanism it has: a winget manifest is used when it exists, and detection falls back to the GitHub release or the vendor page when it does not ([DESIGN.md v0.3](../DESIGN.md)).

## Failure isolation and timeouts

Each provider probe and each update runs under its own timeout and its own error slot. A provider that times out, panics, or errors records `failed` for its own app: the scan completes with the other rows populated, and a batch continues unless `settings.on_failure: stop`. Providers are probed up to `settings.concurrency` at a time.

An update is `ok` only after verification passes: the detected version differs from the recorded `from`, or `verify.sha256_from` matches the downloaded asset. A verify failure keeps the previous record, marks the app `verify_failed`, and preserves the rollback copy.

## Rollback and retention

| Mechanism | Strategy | UI label | Space |
|---|---|---|---|
| `self-update-cli` | Copy the old executable to `rollback/<app_id>/<version>/` | `可回滚` | ~200 MB per app per update |
| `manager` | No copy; `winget install --version`, `npm i -g <pkg>@<ver>`, `choco install <pkg> --version=<ver>` | `可在线回滚` | 0 |
| `declarative` | Only if `retention: auto` finds no online rollback for the command | `可回滚` or `手动` | 0 or the copy |
| `external-ui`, `green` | None; reinstall the previous release | `需重装回滚` / `手动` | 0 |

`settings.retention: auto` keeps a copy only where an online rollback is impossible — a self-updating CLI whose old executable would otherwise be gone — and the cost is visible in the cleanup preview, never silently reclaimed.

A rollback is itself a run: it has a plan, a log, a history record with `action: rollback`, and the same verification requirement in reverse.
