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
| `notify` | enum | `toast` (default), `off` | Whether a settled run raises a notification |

### App entry

| Key | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Stable, unique, lowercase, kebab-case; used for history, log names, and the override merge |
| `form` | enum | yes | `self-update-cli`, `npm-global`, `choco`, `external-ui`, `green` |
| `enabled` | bool | no, default `true` | `false` keeps the entry for reference and skips it everywhere |
| `display_name` | string | no | UI label; falls back to `id` |
| `detect` | block | except `npm-global` and `choco` | Current version: version command and regex, or the executable's version resource |
| `latest` | block | yes | Newest known version |
| `update` | block | form-dependent | How to update; absent for forms Upkeep does not drive |
| `verify` | block | no | Post-update assertion; default is "version changed" |
| `actions` | list | form-dependent | Buttons offered in the row: `open-app`, `open-release-page`, `open-download-page` |
| `cleanup` | list | no | Cleanup rules owned by this app |

Form-specific keys:

| Form | Additional keys |
|---|---|
| `self-update-cli` | `update.args`, `update.needs_proxy` |
| `npm-global` | `package`, `prefer` (`self-update` or `npm`), `update.fallback`; no `detect` block — the form derives it from `package` |
| `choco` | `package`, `update.needs_admin: true`; no `detect` block — `choco outdated` covers every choco app in one call |
| `external-ui` | `kind` (`electron` or `tauri`), `latest.kind: github`, at least one `actions` entry |
| `green` | `latest.kind: url_regex`, `actions: [open-download-page]` |

The executable path always lives in `detect.exe`; a form-specific key never repeats it.

`external-ui` and `green` entries must not declare an `update` block: Upkeep does not run their installers, and a config that claims otherwise is rejected.

### `detect`

| Key | Type | Notes |
|---|---|---|
| `exe` | path | `%VAR%` expansion applies; must be an absolute path after expansion |
| `args` | list | Arguments that print a version; omit to read the file's version resource |
| `regex` | string | Capture group 1 is the version; required when `args` is present |
| `version_source` | enum | `stdout` (default) or `file-version` (the exe's `VS_VERSION_INFO`) |

### `latest`

| `kind` | Required keys | Where the version comes from |
|---|---|---|
| `github` | `repo` | `releases/latest` → `tag_name`, through the resolved proxy; `GITHUB_TOKEN` is optional and raises the rate limit |
| `npm` | — (uses `package`) | `registry.npmjs.org/<package>/latest` → `version` |
| `self-check` | `args` | The tool's own check output, parsed with `regex` |
| `choco` | — (uses `package`) | `choco outdated --limit-output`, one call covering every choco app |
| `file-version` | — (uses `detect.exe`) | The installed binary itself; only usable to confirm a source that is already known |
| `url_regex` | `url`, `regex` | A release or download page; group 1 is the version |

A `kind` whose required keys are missing fails validation at load, not at scan time.

### `update`

| Key | Type | Default | Notes |
|---|---|---|---|
| `args` | list | form default | Arguments appended to the form's command |
| `needs_proxy` | bool | `false` | Inject the resolved proxy into this child |
| `needs_admin` | bool | `false` | Plan an elevation step; `choco` apps always set this |
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
- `form` from the closed set; `latest.kind` from the closed set; unknown variants are errors.
- `detect.exe` and every `cleanup.glob` absolute after expansion; a relative path is an error, and `"TBD"` is accepted only where the [unverified-source rule](#unverified-sources) allows it.
- `detect` present on an `npm-global` or `choco` entry is an error — two sources for one version is a disagreement waiting to happen.
- `keep_newest` and `older_than_days` on the same rule is an error — one filter decides an age.
- `protect` and `only` naming the same child is an error.
- A `self-update-cli` or `npm-global` entry without an `update` block is an error.
- `external-ui` or `green` with an `update` block is an error.
