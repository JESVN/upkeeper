# Providers

A provider is one application form: one file in `src-tauri/src/providers/` implementing `Provider`, registered in `providers/mod.rs`, parameterized by its [config/apps.yaml](../config/apps.yaml) entry. Providers are the only place per-form knowledge lives; `core/` stages are form-agnostic. To add one, follow [adding-a-provider.md](cookbook/adding-a-provider.md).

## The trait

```rust
#[async_trait]
pub trait Provider: Send + Sync {
    fn id(&self) -> &str;
    fn form(&self) -> Form;                                     // selects UI grouping and rollback strategy
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

- `id` / `form` are pure and constant; they never depend on `Ctx`, so the registry can be built before any probe runs.
- `detect` returns the installed version plus the resolved executable path. It reads and runs the tool's own version command; it never guesses from a directory name. A missing executable is `Error::NotInstalled`, which renders as an absent row rather than a failure.
- `latest` returns `None` when the source is configured but reports nothing usable, and never falls back to a guess. A `# TBD` source returns `None` with `Error::SourceUnverified`, which the UI shows as `unknown`.
- `plan` is pure and synchronous: no I/O, no spawning. It receives the detected state and returns what would happen, including whether a rollback copy is taken, the elevation and proxy flags, the processes that must be closed, and the asset size when known.
- `update` performs exactly the plan it was given. It may not raise privilege, choose a different version, or start a second child. It returns the child's exit code and the run log path.
- `cleanup_rules` returns the rules this app's entry declares, with the app's own version available for `keep_matching_version`. Rules are declarative; a provider returns what the config says rather than inventing paths.
- `rollback` restores a previous version when the form supports it, and reports `Error::Unsupported` otherwise — the UI reads that as "reinstall to roll back", not as a failed rollback.

A provider never writes history, never touches `state.json`, never formats UI text, and never calls Win32 or the registry directly: it asks `src/platform/` for a probe, a child, or an elevation. That keeps every provider testable with a fake platform.

## The five forms

| Form | Detect | Update | Unattended update | Rollback strategy |
|---|---|---|---|---|
| `self-update-cli` | `<exe> --version` + regex | `<exe> <update.args>`, proxy injected, stdin null | yes | Copy the old executable to `rollback/<app_id>/<version>/` before the update |
| `npm-global` | `npm ls -g --json` | `npm i -g <pkg>@latest`, or the tool's own self-update when `prefer: self-update` | yes | None kept; `npm i -g <pkg>@<version>` |
| `choco` | `choco outdated --limit-output` | `choco upgrade <pkg>`, elevated | yes, after UAC | None kept; `choco install <pkg> --version=<version>` |
| `external-ui` | exe `VS_VERSION_INFO` (or `latest.kind: github`) | none — the app updates itself | no | None; reinstalling the old release |
| `green` | exe `VS_VERSION_INFO` | none | no | None; manual reinstall |

`external-ui` covers the Electron and Tauri applications that download their own updates; their residue is what cleanup exists for. `green` covers portable applications with no updater at all.

The four unattended-capable forms share one rule: **the update command comes from the config, and the provider verifies the result.** A tool whose update path is interactive is not eligible for a form; it belongs in `external-ui` or `green`.

## Version sources

`latest.kind` is a property of the source, not of the form, so `github`, `npm`, and `url_regex` are implemented once in `core/` and are declared per app. `self-check` and `choco` are the exceptions that need the tool's own execution: a choco probe is one call covering every choco app, which is why the provider drains that call once per scan instead of once per app. `file-version` exists to confirm an already-known source, not to discover a release.

A source that resolves version `X` for an app already at `X` ends the app's involvement in the run; no update is planned and no cleanup rule is evaluated differently because of it.

## Failure isolation and timeouts

Each provider probe and each update runs under its own timeout and its own error slot. A provider that times out, panics, or returns an error records `failed` for its own app: the scan completes with the other rows populated, and a batch continues unless `settings.on_failure: stop`. Providers are probed up to `settings.concurrency` at a time.

An update is `ok` only after verification passes: the detected version differs from the recorded `from`, or `verify.sha256_from` matches the downloaded asset. A verify failure keeps the previous record, marks the app `verify_failed`, and preserves the rollback copy.

## Rollback and retention

`settings.retention: auto` keeps a rollback copy only where an online rollback is impossible: `self-update-cli` applications whose old executable would otherwise be gone. Around 200 MB per such application per update is the cost — visible in the cleanup preview, never silently reclaimed.

For `npm-global` and `choco`, rollback means installing the recorded `from` version again; the UI labels it "online rollback" and stores only the version string in history. `external-ui` and `green` are labelled "manual": Upkeep shows the version to return to and, when it knows one, the download page.

A rollback is itself a run: it has a plan, a log, a history record with `action: rollback`, and the same verification requirement in the reverse direction.
