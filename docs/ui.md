# UI

Six panels in one window. The UI renders state that Core produced and sends back only plans and ids; it never derives a version, decides an update, or touches the filesystem. View-model rules here, component implementation in `src/`.

## Panels

| Panel | Shows | Reads |
|---|---|---|
| Application list | One row per app: current → latest version, state badge, available actions, rollback label | `scan` result, `scan://progress` |
| Progress and log | One line per app in the current run: phase, throughput, ETA, exit result, failure reason | `update://progress`, `run://settled` |
| Cleanup | Per rule: matched count, byte total, and the path list behind it | `plan_clean` result, `clean://progress` |
| Settings | Proxy, concurrency, timeout, failure policy, retention, UAC policy, per-app enable toggles | `settings` command |
| History | Time, app, `from` → `to`, result, duration, log link | `history` command |
| Desktop-app reminder | A `待更新` badge plus `[打开应用]` and `[下载页]` for `external-ui` and `green` rows | `latest`, no update command |

## Row states

| Badge | Meaning | Row actions |
|---|---|---|
| `待更新` | Latest is known and newer than installed | `[更新]` when the form is unattended-capable, otherwise `[打开应用]` / `[下载页]` |
| `最新` | Latest equals installed | none |
| `未知` | The source is unverified (`# TBD`) or returned nothing | `[下载页]` when one is configured |
| `失败` | The probe failed | `[重试]`, `[打开日志]` |
| `校验失败` | The update ran but verification did not pass | `[打开日志]`, `[回滚]` when a copy exists |
| `已跳过` | A guard or a policy decision skipped it | `[重试]` with the reason shown inline |

Rollback label, shown next to the version pair: `可回滚` (a copy exists), `可在线回滚` (the package manager can install the old version), `需重装回滚` (`external-ui`), `手动` (`green`). The label is a property of the form, never of the moment — see [providers.md](providers.md#rollback-and-retention).

## Interaction rules

- **A destructive action previews first.** `[清理]` opens the path list with per-rule byte totals; `[更新]` opens the plan with the target version, the elevation prompt it will trigger, and the processes it needs closed. Execution is enabled only for the plan that is on screen.
- **`[打开应用]` and `[下载页]` are the only ways Upkeep interacts with a GUI application.** Both go through the opener plugin with a resolved path or URL; no installer is ever started, and no file inside an install directory is written.
- **A percentage is shown only when the child reported one.** Otherwise the row shows an indeterminate activity indicator; a fabricated progress bar is worse than none.
- **`[取消]` cancels the run, not the row.** The whole process tree is killed and each in-flight app records `cancelled` — see [execution-safety.md](execution-safety.md#cancellation-and-teardown).
- **Failure text is the tool's own last error line plus the exit code**, with `[打开日志]` on the row. The UI does not paraphrase a failure into advice.
- **Staleness comes from `checked_at`.** The window shows how old the scan is and never re-probes on focus; a scan happens when the user asks for one.
- **Default selection is conservative**: unattended-capable apps with an available update are checked; `external-ui` and `green` rows are unchecked, because updating them needs a human in the application's own UI.
- **Cleanup defaults to nothing selected** and shows the reclaimable total regardless, so the first click is always a look rather than a delete.

## Copy and notifications

UI copy is Chinese and lives in one module under `src/lib/`; components import strings and never inline them, so a locale can be added without touching a component. Badge and label names above are the canonical keys.

Notifications use `tauri-plugin-notification`. Windows requires a stable AppId for a non-packaged executable, so the installer creates a Start Menu shortcut and the notification is raised from that identity; an unpackaged dev run may not show a toast, and that is expected rather than a bug.
