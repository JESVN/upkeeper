# Upkeep

A Windows desktop console that puts this machine's application updates and their update residue in one place: which applications have a new version, one-click updates for the ones that can update unattended, and a previewed, guarded way to reclaim what the updaters leave behind (measured at roughly 661 MB on first inspection).

**Status: skeleton.** The directories, the contracts, and the documentation exist; there is no `package.json`, no `Cargo.toml`, and no Rust toolchain on this machine yet. [DESIGN.md](DESIGN.md) is the v0.1 design record and [AGENTS.md](AGENTS.md) is where the work starts.

## What it does

- **Shows** current and latest versions for the applications you add to the registry, including the desktop applications Upkeep deliberately refuses to update for you.
- **Updates** what can be updated unattended — self-updating CLIs, global npm packages, and Chocolatey through a UAC prompt — with a preview, a live progress line, and a per-run log.
- **Cleans** updater residue: Tauri updater temp directories, the Electron updater cache, self-update backups, and stale runtime natives. Every deletion is previewed with its byte total, guarded by a process check, and dry-run by default.
- **Never** runs a GUI application's installer and never writes inside an install directory.

## Read this first

| Document | For |
|---|---|
| [AGENTS.md](AGENTS.md) | The rules in force, the repository layout, and the command surface |
| [docs/architecture.md](docs/architecture.md) | How the core is put together: the pipeline, the layers, the IPC surface |
| [docs/environment.md](docs/environment.md) | What was measured on this machine, and how to re-measure it |
| [docs/execution-safety.md](docs/execution-safety.md) | Why children get a proxy but not the parent, why stdin is null, how elevation returns output |
| [docs/cleanup-rules.md](docs/cleanup-rules.md) | The three hard rules, and the checklist a new rule has to pass |
| [config/apps.yaml](config/apps.yaml) | The registry: applications, version sources, cleanup rules |
| [docs/testing.md](docs/testing.md) | What each milestone has to prove |
| [docs/postmortem/](docs/postmortem/README.md) | The failures that produced the rules above |
| [DESIGN.md](DESIGN.md) | The frozen v0.1 design and the survey of prior art it was based on |

## Milestones

M0 toolchain and shell · M1 read-only scan · M2 unattended updates · M3 cleanup and rollback · M4 elevation, desktop reminders, settings. Acceptance criteria are in [DESIGN.md](DESIGN.md#8-里程碑与验收标准) and the evidence each one requires is in [docs/testing.md](docs/testing.md).
