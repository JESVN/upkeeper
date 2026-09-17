# `scripts/`

Repo-local helpers. No product logic, and nothing the shipped application imports.

| Script | Purpose |
|---|---|
| `doc-budgets.mjs` (M0) | Counts words against the ceilings in [docs/AGENTS.md](../docs/AGENTS.md#word-budgets), treating a CJK character as one word |
| `check-links.mjs` (M0) | Resolves every relative Markdown link and anchor in the repository |
| `notes-format.mjs` (M0) | Checks Agent Note headers, statuses, and path-encoded lifecycle/class folders |

Conventions for anything added here:

- Node ESM, no dependencies beyond what the frontend already installs, runnable as `pnpm run <name>`.
- A script exits non-zero on failure and prints the offending path, so it can be used as a gate.
- A script never modifies source files; a generator that rewrites Markdown is a different decision and needs an [Agent Note](../.agents/notes/README.md).

## Behaviour baselines

`omp-clean.ps1` and `omp-maintain.ps1` are the machine's existing PowerShell maintenance scripts. They stay where they are and stay authoritative for what they do: Upkeep keeps them as the CLI fallback and as the behaviour baseline for cleanup ([AGENTS.md](../AGENTS.md)). When a read-only copy is placed here for comparison, it goes under `scripts/baseline/` with its source path recorded in the file header, is never edited, and is never the version a user runs.
