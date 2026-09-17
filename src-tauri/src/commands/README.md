# `src-tauri/src/commands/`

The Tauri boundary. One function per entry in the command table of [docs/architecture.md](../../../docs/architecture.md#ipc-surface), grouped by area (`scan.rs`, `update.rs`, `clean.rs`, `settings.rs`, `history.rs`, `logs.rs`, `external.rs`).

A handler does exactly four things:

1. Validate and normalize its arguments — reject an unknown app id, an empty selection, a plan id that is not the most recent plan, before any work starts.
2. Call the `core` function that owns the operation.
3. Map the result into the payload the UI expects, including turning the error enum into the fields a row renders.
4. Emit the progress events for that operation, after each unit of work completes.

Rules:

- No filesystem access, no process spawning, no version parsing, and no rule matching in this module: a handler that needs one of those calls `core`.
- No blocking work on the Tauri thread that would freeze the window; long operations run on the async runtime and report through events.
- `cancel_run` is idempotent: cancelling a settled run is a no-op, not an error.
- A mutating command takes its plan id from the UI and never re-plans; when the plan is stale it returns a typed "plan expired" error so the UI can show the refreshed plan instead of running something else.
- Every emitted event carries the ids the UI needs to correlate it with a row (`app_id`, `run_id`, `plan_id`), so a payload never has to be matched by order.
