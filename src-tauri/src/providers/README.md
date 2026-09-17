# `src-tauri/src/providers/`

One file per application form, plus `mod.rs` holding the trait, the `Form` enum, and the registry.

| File | Form | Update path |
|---|---|---|
| `self_update_cli.rs` | `self-update-cli` | The tool's own update command, proxy injected, rollback copy taken first |
| `npm_global.rs` | `npm-global` | The tool's self-update when `prefer: self-update`, otherwise `npm i -g <pkg>@latest` |
| `choco.rs` | `choco` | `choco upgrade`, elevated, with the temp-file JSONL handoff |
| `external_ui.rs` | `external-ui` | None: detect, badge, and open the app or the release page |
| `green.rs` | `green` | None: detect and offer the download page |

The trait contract, per-form responsibilities, and the rollback matrix are in [docs/providers.md](../../../docs/providers.md); the procedure for adding one is [adding-a-provider.md](../../../docs/cookbook/adding-a-provider.md).

Rules:

- A provider is parameterized by its `apps.yaml` entry and holds no per-application table of its own.
- A provider reads through `platform` and returns an `Outcome`; it never touches `state`, `history`, or the UI, and never calls a Win32 API directly.
- `plan` does no I/O. `update` does exactly what the plan says.
- The registry maps a config entry to a provider by form and returns a trait object; `core` never matches on the form.
- A file header states the one non-obvious fact about the form — why the version command is what it is, or which flag keeps it non-interactive — and nothing else.
