# `src/features/` — panels

One directory per panel, matching the six panels in [docs/ui.md](../../docs/ui.md). Each directory owns its components, its view models, and its loading, empty, and failed states.

| Directory | Panel |
|---|---|
| `apps/` | Application list: rows, version pairs, badge selection, manual selection, and the unscanned empty state |
| `updates/` | Batch actions, live progress rows, per-run log tail |
| `cleanup/` | Rule groups, byte totals, the previewed path list, execution controls |
| `settings/` | `settings:` fields and per-app enable toggles |
| `history/` | History table with `from` → `to`, result, duration, log link |
| `notify/` | Notification wiring for a settled run |

Rules:

- A panel talks to the core only through `src/ipc/`.
- A panel does not import from a sibling panel. Shared display logic moves to `components/` or `lib/`.
- Every panel implements the three non-happy states explicitly, because "the scan failed" and "the app has no version source" are normal conditions here, not edge cases.
- A panel that can start a destructive run shows the plan it is about to execute and sends back that plan's id.
