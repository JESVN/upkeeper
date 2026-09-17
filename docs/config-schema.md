# `apps.yaml` schema

The application registry: which apps Upkeep manages, how it detects their versions, how it updates them, and what it may clean. The shipped default is [config/apps.yaml](../config/apps.yaml). Semantics live in [providers.md](providers.md), [cleanup-rules.md](cleanup-rules.md), and [execution-safety.md](execution-safety.md); this file owns names, types, allowed values, defaults, and validation.

## Files and precedence

| File | Role |
|---|---|
| `config/apps.yaml` (repo) | Shipped default; the only file the repository versions |
| `%LOCALAPPDATA%\Upkeep\apps.yaml` (user) | Optional override; merged per app `id`, with the user entry winning field by field |

`settings` merges per key. A user entry may remove a shipped app with `enabled: false`; it may add an app that the shipped file does not mention. Configuration is loaded and validated once at startup, and a validation failure is reported in the UI before any command runs — an unknown form or a rule that cannot be anchored never degrades into a silently skipped app.

## Top level

| Key | Type | Notes |
|---|---|---|
| `version` | `1` | Schema version; a different value is rejected rather than guessed |
| `settings` | mapping | See below |
| `apps` | list | See [app entry](#app-entry) |

### `settings`

| Key | Type | Allowed / default | Effect |
|---|---|---|---|
| `proxy` | string | `system` (default), `none`, or `http://host:port` | Source of the per-child proxy value; `system` reads the registry per run |
| `concurrency` | int | default `4` | Providers probed at once; updates are serialized per app directory |
| `timeout_s` | int | default `900` | Per provider probe and per update; a provider may set a stricter value |
| `on_failure` | enum | `continue` (default), `stop` | Whether a failed update halts the rest of the batch |
| `retention` | enum | `auto` (default), `none` | `auto` keeps a rollback copy only for forms that cannot roll back online |
| `uac` | enum | `allow` (default), `mark-only` | Whether Upkeep may start an elevated helper or only hand over the command |
| `notify` | enum | `toast` (default), `off` | Whether a run the user started raises a notification when it settles. Nothing scans on its own, so a notification can never arrive by itself |

### App entry

| Key | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Stable, unique, lowercase, kebab-case; used for history, log names, and the override merge |
| `form` | enum | yes | The mechanism: `manager`, `self-update-cli`, `external-ui`, `green`, `declarative` |
| `enabled` | bool | no, default `true` | `false` keeps the entry for reference and skips it everywhere |
| `display_name` | string | no | UI label; falls back to `id` |
| `detect` | block | except `manager` | Installed version and path. For `manager` it may carry only `exe`, because the manager's listing answers the version |
| `latest` | block or list | yes | One source, or an ordered chain of sources tried in order |
| `update` | block | mechanism-dependent | How to update; absent for mechanisms Upkeep does not drive, and optional for `manager` (the manager row supplies the command, so the block carries per-app overrides only) |
| `verify` | block | no | Post-update assertion; default is "version changed" |
| `actions` | list | mechanism-dependent | Buttons offered in the row: `open-app`, `open-release-page`, `open-download-page` |
| `cleanup` | list | no | Cleanup rules owned by this app |

Mechanism-specific keys:

| Mechanism | Additional keys |
|---|---|
| `manager` | `manager` (one of the table in [providers.md](providers.md#managers)), `package` (that manager's id), `prefer` (`self-update` when the tool also updates itself), `update.fallback` |
| `self-update-cli` | `update.args`, `update.needs_proxy` |
| `external-ui` | `kind` (`electron` or `tauri`), at least one `actions` entry; `manager` and `package` may be present so winget can answer the version |
| `green` | `latest.kind: url_regex`, `actions: [open-download-page]` |
| `declarative` | `detect.command`, `update.command` |

The executable path always lives in `detect.exe`; a mechanism-specific key never repeats it.

`external-ui` and `green` entries must not declare an `update` block: Upkeep does not run their installers, and a config that claims otherwise is rejected.

### `detect`

| Key | Type | Notes |
|---|---|---|
| `exe` | path | `%VAR%` expansion applies; must be an absolute path after expansion |
| `command` | string | The executable to run for the version, when it is not the same as `exe` |
| `args` | list | Arguments that print a version; omit to read the file's version resource |
| `regex` | string | Capture group 1 is the version; required when `args` is present |
| `version_source` | enum | `stdout` (default), `file-version` (the exe's `VS_VERSION_INFO`), or `manager` (the listing call) |

### `latest`

| `kind` | Required keys | Where the version comes from |
|---|---|---|
| `winget` | — (uses `package`) | `winget upgrade`, one call covering every winget-managed app |
| `manager` | — (uses `manager` and `package`) | The manager's own listing call, shared with detect |
| `github` | `repo` | `releases/latest` → `tag_name`, through the resolved proxy; `GITHUB_TOKEN` is optional and raises the rate limit |
| `npm` | — (uses `package`) | `registry.npmjs.org/<package>/latest` → `version` |
| `self-check` | `args` | The tool's own check output, parsed with `regex` |
| `choco` | — (uses `package`) | `choco outdated --limit-output`, one call covering every choco app |
| `file-version` | — (uses `detect.exe`) | The installed binary itself; only usable to confirm a source that is already known |
| `url_regex` | `url`, `regex` | A release or download page; group 1 is the version |

A `kind` whose required keys are missing fails validation at load, not at scan time.

**A chain is tried in order and the first source that answers wins.** A single mapping is sugar for a one-element chain. A source that returns nothing usable is not an error unless every source in the chain did: then the row is `unknown` with the reason from the last source.

### `update`

| Key | Type | Default | Notes |
|---|---|---|---|
| `command` | string | mechanism default | The executable to run; required for `declarative` |
| `args` | list | mechanism default | Arguments appended to the command |
| `needs_proxy` | bool | `false` | Inject the resolved proxy into this child. Never set it for `winget`, which reads the system proxy itself |
| `needs_admin` | bool | `false` | Plan an elevation step; `choco` and machine-wide `winget` upgrades set this |
| `preflight` | bool | `false` | Probe throughput before a large download |
| `eta_guard_min` | int | — | Stop and warn when the estimated duration exceeds this many minutes |
| `fallback` | enum | — | `npm` retries a failed self-update through the package manager |

### `verify`

| Key | Type | Default | Notes |
|---|---|---|---|
| `expect` | enum | `changed` | `changed` requires a different detected version; `unchanged` is for a check-only app |
| `sha256_from` | string | — | `github:<owner>/<repo>` resolves the released asset hash from the feed and compares it to the downloaded file |

### `cleanup` rule fields

| Key | Type | Default | Notes |
|---|---|---|---|
| `glob` | string | — | Required; must be anchored to an absolute path after `%VAR%` expansion |
| `keep_newest` | int | — | Keep the N most recently written matched entries |
| `older_than_days` | int | — | Keep entries written within the window |
| `keep_matching_version` | bool | `false` | Keep the entry matching the detected installed version |
| `only` | list of names | — | Restrict a matched directory to these first-level children |
| `protect` | list of names | — | Never touch these subtrees; wins over `only` |
| `skip_if_running` | list of processes | — | Skip the whole rule while any named process exists |
| `quiet_period_s` | int | — | Skip entries written within this many seconds |

Filter semantics and the three hard rules are in [cleanup-rules.md](cleanup-rules.md#matching).

## Unverified sources

The literal string `"TBD"` marks a value nobody has confirmed. It is accepted in `detect.exe`, `latest.repo`, `latest.url`, and `latest.regex`, and nowhere else — a rule's `glob` must always be a real anchored path, because a placeholder there is a deletion hazard rather than a missing version.

An entry carrying `"TBD"` is listed but never scanned: it reports `unknown` with the reason, so the intent to manage the application is visible without a fabricated version. Replace the marker only together with the probe result; [verifying-a-release-source.md](cookbook/verifying-a-release-source.md) is the procedure.

## Validation rules

- `id` unique, lowercase, kebab-case; a duplicate is a load error, not last-wins.
- `form` from the closed mechanism set, `manager` from the manager table, `latest.kind` from the closed set; unknown variants are errors.
- `form: manager` requires both `manager` and `package`; `detect` on such an entry may carry only `exe`, because the listing call owns the version.
- `manager` or `package` on a mechanism that cannot use them — anything but `manager` and `external-ui` — is an error.
- `form: declarative` requires `update.command`, and `detect` must carry `exe` or `command`.
- `detect.exe` and every `cleanup.glob` absolute after expansion; a relative path is an error, and `"TBD"` is accepted only where the [unverified-source rule](#unverified-sources) allows it.
- `keep_newest` and `older_than_days` on the same rule is an error — one filter decides an age.
- `protect` and `only` naming the same child is an error.
- A `self-update-cli` or `declarative` entry without an `update` block is an error; a `manager` entry may omit it, because the manager row supplies the command and `update` then carries per-app overrides only.
- `external-ui` or `green` with an `update` block is an error.
