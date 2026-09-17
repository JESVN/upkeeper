# `src/` — frontend

React 19 + Vite + TypeScript + Tailwind v4. The UI presents state produced by the Rust core and sends back plans and identifiers; every rule for what a panel shows is in [docs/ui.md](../docs/ui.md).

| Path | Owns |
|---|---|
| `main.tsx` / `App.tsx` | The React entry and the window shell: the title strip and the content area the panels mount into. The shell renders state it was given and invokes nothing on mount |
| `ipc/` | The typed bridge to the core: one wrapper per command and per event, and the payload types mirrored from the Rust side |
| `features/apps/` | The application list: rows, version pairs, badges, selection |
| `features/updates/` | Batch actions and the live progress and log panel |
| `features/cleanup/` | The cleanup panel: per-rule matches, byte totals, path list, execution |
| `features/settings/` | The settings panel for `settings:` fields and per-app enable toggles |
| `features/history/` | The history table and its log links |
| `features/notify/` | Notification permission, toast composition, and the settle notification |
| `components/` | Shared presentational primitives with no data and no copy of their own |
| `lib/` | Formatting (bytes, durations), version display helpers, and the UI copy module |
| `styles/` | The Tailwind entry point and theme tokens |

What does not belong in `src/`: filesystem or OS access (only the core has it), update or cleanup decisions (the core decides), per-application knowledge (it lives in `config/apps.yaml`), and duplicated payload types — a new payload is declared in `ipc/` and imported.

Milestone M1 delivers the application list, the history table, and the notification path; the remaining panels follow in M2–M4 ([milestones](../DESIGN.md#8-里程碑与验收标准)).
