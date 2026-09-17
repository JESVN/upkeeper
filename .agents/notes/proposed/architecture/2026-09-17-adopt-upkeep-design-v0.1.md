# Agent Note: Adopt the Upkeep v0.1 design — a provider per form with a cleaning stage

Status: proposed

## Problem

Updates on this machine arrive through five unrelated mechanisms: self-updating CLIs (`omp`, `pi`, `codex`, `claude`), 26 globally installed npm packages, Chocolatey, four desktop applications that update themselves, and portable applications with no updater at all. Each is discoverable only by remembering its own command, and two of them fail in ways that waste real time rather than reporting an error — `omp update` spent its full 15-minute limit on a direct connection that never used the system proxy ([postmortem 0001](../../../../docs/postmortem/0001-omp-update-timeout-and-proxy.md)).

The second half of the problem is what the updaters leave behind: 53 Tauri updater directories, an Electron `pi-desktop-updater` cache, self-update `.bak` files, and stale runtime natives, measured at ≈661 MB reclaimable. Those paths exist only as folklore in one machine's `%TEMP%`, so cleaning them is a manual, per-application guess.

No available tool covers both halves. Package-manager front-ends (`UniGetUI`, `topgrade`'s cleanup phase) only know the package managers they support and cannot see an Electron or Tauri application's own updater residue; `Scoop`'s `cleanup` and `choco` hooks clean only what they installed. The applications that produce most of the residue are exactly the ones no package manager installed.

## Proposal

Build Upkeep: a Windows-only Tauri v2 desktop console with a scan → plan → exec → verify → clean → history pipeline in Rust, where each *form* of application is one `Provider` implementation parameterized entirely by a `config/apps.yaml` entry.

### Provider contract

One trait, one file per form, and no per-app branching in `core/`:

```rust
#[async_trait]
pub trait Provider: Send + Sync {
    fn id(&self) -> &str;
    fn form(&self) -> Form;
    async fn detect(&self, ctx: &Ctx) -> Result<Installed>;
    async fn latest(&self, ctx: &Ctx) -> Result<Option<String>>;
    fn plan(&self, i: &Installed, l: &Option<String>) -> Plan;
    async fn update(&self, ctx: &Ctx, p: &Plan) -> Result<Outcome>;
    fn cleanup_rules(&self) -> Vec<Rule>;
    fn rollback(&self, ctx: &Ctx, to: &str) -> Result<Outcome> { Err(Error::Unsupported) }
}
```

The two contract decisions that matter most: `plan` is pure and is the only input to `update`, and `update` may not widen it. That is what lets the UI state exactly what a batch will do before it does anything, and what makes "the scan changed nothing" a testable claim rather than an intention.

### Cleaning as a first-class stage

The usual arrangement — update first, clean as an afterthought — cannot work here, because the largest residue is created by applications Upkeep does not update. So cleanup takes the same shape as updating: a declarative `Rule` (anchored glob, filters, process guard, quiet period), a mandatory preview with byte accounting, and three hard rules — delete only what a glob matched, skip the whole rule while a guard process runs, and dry-run by default. The rules live in `apps.yaml` next to the application that owns them, because the knowledge of "this is residue" belongs to the application, not to a central cleanup list.

### Deliberate refusal

Upkeep does not drive a GUI application's updater. `external-ui` and `green` applications are detected, badged, and given `[打开应用]` or `[下载页]`; the installer is never started and nothing inside an install directory is ever written. Driving those updaters would require racing a self-updater in the same directory for a benefit the user gets anyway by clicking the badge.

Work is user-initiated: a scan runs only when the user asks for one, nothing is ticked on their behalf, and no notification can arrive unprompted. That contract, with its rationale and rejected alternatives, is owned by [scan and update are user-initiated](2026-09-17-user-initiated-scan-and-selection.md).

## Alternatives considered

- **`topgrade` as the whole solution.** Its `--cleanup` is a global phase with hardcoded per-manager knowledge, and its `[commands]` hooks are shell commands rather than a declarative rule with guards and byte accounting. It cannot clean residue from applications it did not install, which is the majority of the 661 MB. Kept as a design reference for hooks and dry-run.
- **`UniGetUI` as the front-end.** 26k stars and a real update GUI, but it manages only the package managers it supports: no Electron/Tauri updater residue, no portable applications with a version resource, and no place for a rule that protects a browser profile.
- **`gup`'s provider model reused wholesale.** The closest prior art (one provider per tool, four methods, failure isolation, JSONL logs). Rejected as a base because it has no cleanup hook and no rollback, and because the project is days old — but its shape is what the trait above is modelled on.
- **Declarative recipes only, no code (`fp-appimage-updater` style).** The archived project's "one YAML recipe per app plus an escape hatch" is attractive, and `apps.yaml` adopts the declarative part. It was rejected as the *whole* mechanism because proxy injection, elevation with output recovery, timeout with process-tree cancellation, and glob-with-guard deletion are all behaviour that a YAML file cannot express and that must not be re-implemented per application.
- **Extending `omp-clean.ps1`.** Rejected as the main path — the script is correct and stays as a behaviour baseline, but a PowerShell script cannot give a preview with byte accounting, a process guard, or a history record, and one script per application does not converge.
- **Waiting for upstream fixes** (the `electron-builder` residue issue, the Bun-fetch proxy issue). Rejected: the residue is created today, by applications already installed.

## Acceptance criteria

- **M0** — `pnpm tauri dev` opens a window with the Rust toolchain installed through an explicit proxy or mirror ([procedure](../../../../docs/development.md#bootstrap-without-a-working-system-proxy)).
- **M1** — every configured application reports the version its own tool reports, and a scan is proven read-only by comparing file hashes of the managed directories before and after.
- **M2** — `omp` and `pi` each upgrade in one run, the parent process environment has no proxy variable before or after, one broken entry fails alone, and no child waits on stdin.
- **M3** — the first cleanup preview matches a manual measurement of the same paths, execution removes exactly the previewed entries with the freed total computed from the results, and a browser profile's `Default` plus the current version's natives are byte-identical afterwards.
- **M4** — a Chocolatey upgrade completes through the elevated helper with its output recovered, and a desktop application row starts no installer.

## Risks

- **The registry drifts.** Unverified `latest` sources (CC Switch, Cockpit Tools, Tuanjie Cowork, BCompare) stay `# TBD` and render as `unknown`; a wrong guess would be worse than a missing version.
- **Cleanup is irreversible.** Mitigated by the three hard rules, the mandatory preview, fixture-based tests, and `omp-clean.ps1` as an independent baseline to compare results against.
- **The proxy port changes under us.** Mitigated by reading the registry on every run rather than storing a value.
- **npm-installed CLIs are `.cmd` shims on Windows.** `pi`, `codex`, and `claude` cannot be spawned as executables without a shell, which the spawning rules forbid. The committed approach is to resolve the shim to its Node script and spawn `node` with it; the alternative would be relaxing the no-shell rule, which is not acceptable for an argument vector built from config.
- **Elevation output is lost through UAC.** Mitigated by the temp-file JSONL handoff, which is a decision this note commits to rather than an implementation detail.
- **Scope creep toward a package manager.** The non-goals are explicit: no cross-platform, no store, no replacement for `choco` or `npm`.
