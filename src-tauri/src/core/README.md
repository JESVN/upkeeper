# `src-tauri/src/core/`

The pipeline: `config → scan → plan → exec → verify → clean → history`. Stage contracts and the exit type of each stage are in [docs/architecture.md](../../../docs/architecture.md#stages).

| Module | Owns |
|---|---|
| `config.rs` | Loading and merging `apps.yaml`, `%VAR%` expansion, validation, the `Registry` type |
| `scan.rs` | The per-provider probe loop: bounded concurrency, per-provider timeout, failure isolation, `state.json` update |
| `plan.rs` | Turning scan results into a `Plan`: update necessity, elevation, proxy, processes to close, rollback copy, byte estimates |
| `exec.rs` | Running a plan: the child environment contract, output streaming, timeout, cancellation, rollback copy before an update |
| `verify.rs` | The post-update assertion and the `verify_failed` outcome |
| `clean.rs` | Rule matching, filters, byte accounting, the preview, and the per-entry deletion loop |
| `history.rs` | The JSONL record shape, appending, and the `state.json` write |
| `error.rs` | The one error enum, with the evidence each variant carries |
| `sources/` | The version sources that are form-independent: `github`, `npm`, `url_regex`, `file-version`, `choco` |

Rules:

- A stage takes what it needs as arguments and returns its result; it does not reach for global state or re-read the config.
- `plan` and the matching half of `clean` are pure and synchronous, so both are testable without a filesystem or a child process.
- The stages do not know about Tauri; the command layer adapts them. Progress reporting is a callback or a channel passed in, never a direct `emit`.
- A stage failure leaves enough evidence for the row: the failing stage, the app or rule, and the reason.
