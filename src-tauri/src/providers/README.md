# `src-tauri/src/providers/`

One file per **mechanism**, plus the manager table. A new *application* never lands here: it is a `config/apps.yaml` entry.

| File | Mechanism | Update path |
|---|---|---|
| `self_update_cli.rs` | `self-update-cli` | The tool's own update command, proxy injected, rollback copy taken first |
| `managers.rs` | `manager` | One table row per manager: winget, npm, pnpm, choco, uv, dotnet, pip, go… — listing, upgrade template, elevation, proxy, silence flags |
| `external_ui.rs` | `external-ui` | None: detect, badge, and open the app or the release page |
| `green.rs` | `green` | None: detect and offer the download page |
| `declarative.rs` | `declarative` | Whatever the config's `update.command` says, with the same execution guarantees as the built-in mechanisms |

`mod.rs` holds the trait, the `Form` enum, and the registry that maps a config entry to a provider.

Contracts: [docs/providers.md](../../../docs/providers.md). Procedures for each of the three costs: [adding-a-provider.md](../../../docs/cookbook/adding-a-provider.md).

Rules:

- A provider is parameterized by its `apps.yaml` entry and holds no per-application table of its own.
- A provider reads through `platform` and returns an `Outcome`; it never touches `state`, `history`, or the UI, and never calls a Win32 API directly. `plan` does no I/O, and `update` does exactly what the plan says.
- The registry resolves by mechanism; `core` never matches on it, and nothing here knows an application by name.
- A manager row is an executable claim: it is added with the first application that needs it, after its commands have been run on this machine — never copied from documentation.
- A file header states the one non-obvious fact about the mechanism — why the version command is what it is, or which flag keeps it non-interactive.
