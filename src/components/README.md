# `src/components/` — shared primitives

Presentational building blocks used by more than one panel: the badge, the row shell, the byte and duration formatters' display wrappers, the confirm dialog, the log viewer, the empty state.

Rules:

- Props in, elements out. No `invoke`, no store access, no event subscription, no data fetching.
- No user-visible string literals: copy comes from `src/lib/`'s copy module, passed as a prop or imported there.
- A component that only one panel uses belongs in that panel's directory until a second consumer appears. Pre-shared abstractions with a single caller are a cost, not a saving.
- Variants are explicit props unioned into a closed set, not booleans that combine into states nobody designed.
- A badge or dialog that names a state takes the state value from the core's vocabulary — `pending`, `unknown`, `failed`, `verify_failed`, `skipped` — never a display string a caller invented.
