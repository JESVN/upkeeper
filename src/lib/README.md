# `src/lib/` — formatting, versions, copy

Pure helpers with no React and no IPC:

| File | Owns |
|---|---|
| `copy.ts` | Every user-visible string, keyed; the single home for UI text |
| `bytes.ts` | Byte totals and throughput formatting, matching the precision the cleanup panel shows |
| `duration.ts` | Durations and ETA formatting |
| `version.ts` | Version parsing and comparison for display, including the normalization of a `v` prefix and prerelease suffixes |

Rules:

- **Display only.** A version comparison here decides how a pair of versions is rendered, never whether an update is needed — the core makes that decision and reports the state.
- `version.ts` handles the tag formats the registry actually contains; an unparseable version renders as-is rather than throwing, because a display path must not break a scan result.
- `copy.ts` is the only module with user-visible text. A component that needs a new string gets a new key here, and a key that stops being used is deleted in the same change.
- A pure helper has a unit test beside it; these are the cheapest tests in the project and the ones most likely to catch a formatting regression before a user sees it.
