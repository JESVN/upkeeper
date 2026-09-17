# AGENTS.md — Frontend

These rules supplement the repo-wide [conventions](../AGENTS.md#约定). The ownership map is [README.md](README.md); the panels and their badges are defined in [docs/ui.md](../docs/ui.md).

- **A component never calls `invoke` or `listen`.** All IPC goes through `src/ipc/`; a component imports a typed function and receives a typed result. A command or event name appearing outside `src/ipc/` is a bug.
- **The UI renders state it was given.** It never computes a version comparison for a decision, never decides that an update is needed, and never touches a path or URL it constructed itself. Badges and labels are selected from the states Core reported.
- **`features/<panel>/` owns its panel and nothing else.** One directory per panel — `apps`, `updates`, `cleanup`, `settings`, `history`, `notify` — each holding its own components and view models. A second panel importing from a sibling's internals means the shared part belongs in `components/` or `lib/`.
- **`components/` stays presentational.** Props in, elements out: no data fetching, no formatting decisions, no copy that a panel might need to change.
- **UI copy lives in one module under `lib/`.** No string literal that a user reads may appear in a component; a new user-visible string is added to the copy module in the same change.
- **No destructive action without a preview.** A control that would delete or update something is enabled only for a plan that is on screen, and the confirm step sends back the plan id it displayed.
- **`strict: true`, and an `any` needs a reason in the same line.** A payload type that mirrors a Rust serde type is declared once in `src/ipc/` and imported everywhere it is needed — never redeclared beside a component.
- **Tailwind utilities through the theme tokens in `src/styles/`.** No ad-hoc colour or spacing values; a new token is added to the theme rather than inlined.
- A test for a panel asserts the state it renders for each badge and the loading, empty, and failed branches, not the styling.
