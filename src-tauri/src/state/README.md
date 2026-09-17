# `src-tauri/src/state/`

Everything Upkeep writes, and the single place that decides where it goes.

| Item | Path | Contract |
|---|---|---|
| Home | `%LOCALAPPDATA%\Upkeep`, overridable with `UPKEEP_HOME` | Created on demand; every other path is derived from it |
| `state.json` | `home/state.json` | Cache of each app's last-known version and `checked_at`; written atomically (temp file + replace), never appended |
| `history.jsonl` | `home/history.jsonl` | Append-only, one record per settled action; never rewritten or compacted in place |
| Logs | `home/logs/<app_id>-<run>.log` | One file per app per run, ANSI-free, referenced by the history record |
| Rollback | `home/rollback/<app_id>/<version>/` | Present only for forms whose [retention policy](../../../docs/providers.md#rollback-and-retention) keeps a copy |
| User config | `home/apps.yaml` | Optional override of the shipped registry |

Rules:

- A record is appended after the operation settles, so a crashed run leaves evidence of reaching a state, never a claim of completing one.
- A read of `state.json` that fails to parse is a warning plus a fresh cache, never a startup failure; `history.jsonl` is treated as the authority, and an unreadable line is skipped with a report rather than a panic.
- Log file names carry the run timestamp, so two runs never share a file and a log is never truncated.
- Nothing in this module logs on its own; it returns paths and writes what it is given.
- History records are the only durable record of what happened — never rewrite one to correct a version string, add a record that supersedes it.
