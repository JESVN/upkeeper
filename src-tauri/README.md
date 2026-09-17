# `src-tauri/` — Rust core

The Tauri v2 application: the command surface, the pipeline, the providers, and the platform layer. Contracts are in [docs/architecture.md](../docs/architecture.md); this file is the ownership map.

| Path | Owns |
|---|---|
| `src/main.rs` | Process entry: Tauri builder, plugin registration, state initialization, window setup |
| `src/lib.rs` | The module tree and the `run()` builder; no logic |
| `src/commands/` | The `#[tauri::command]` surface: argument validation, event emission, result mapping |
| `src/core/` | The pipeline stages — `config`, `scan`, `plan`, `exec`, `verify`, `clean`, `history` — plus the error type and the plan types |
| `src/providers/` | `mod.rs` with the `Provider` trait, the `Form` enum, and the registry; `managers.rs` with the manager table; one file per mechanism |
| `src/platform/` | Proxy resolution from the registry, the HTTP client, process enumeration and termination, elevation, exe version reading, ANSI stripping |
| `src/state/` | Path resolution under `UPKEEP_HOME` / `%LOCALAPPDATA%\Upkeep`, the JSONL appender, the atomic `state.json` writer, log file naming |
| `build.rs`, `tauri.conf.json`, `capabilities/`, `icons/` | The build hook, the window and bundle settings, the capability set granted to the main window, and the bundled icons |
| `tests/` | Integration tests over the whole pipeline with fixtures built in temp directories |

What does not belong here: UI copy, per-application knowledge outside a `config/apps.yaml` entry, a second process-spawning path, and any cleanup code that is not driven by a declared rule.
