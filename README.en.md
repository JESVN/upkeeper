# Upkeep

[中文](README.md)

**A local Windows-only desktop console: every kind of application update on the machine in one window — package managers and ecosystems, self-updating desktop applications, portable applications, and anything else expressible as a command line; plus safe reclamation of the residue those updaters leave behind.**

![Status](https://img.shields.io/badge/status-M0%20shell-yellow)
![Platform](https://img.shields.io/badge/platform-Windows%2011%20x64-lightgrey)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Rust](https://img.shields.io/badge/Rust-stable-black)

> The repository stands at **M0**: the Rust toolchain, a Tauri v2 + React 19 + Vite + Tailwind v4 scaffold, and three documentation gates are in place, and `pnpm tauri dev` opens a window. Scanning, updating, and cleanup have not started — see [Milestones](#-milestones).

---

## What this is

Upkeep runs entirely on this machine with no account. It touches the network only for the official sources it checks for versions and updates, and only when you ask it to: nothing is scanned in the background. It does three things: **see it** (installed vs latest in one screen), **update it** (batch updates for the forms that can update unattended, with progress, failure isolation, proxy injection, and UAC elevation), and **clean it** (a preview and a byte total before anything is deleted).

It puts update paths with nothing in common behind one set of mechanisms, and it does not pick favourites:

| Mechanism | Examples | How it updates | Unattended |
|---|---|---|---|
| Ecosystem manager | winget, npm, pnpm, choco, uv, dotnet, pip, go… | each manager's own command | ✅ |
| Self-updating CLI | `omp`, `pi`, `codex`, `claude` | the tool's own `update` | ✅ |
| Desktop application | PiDeck, CC Switch, Clash Verge | the app updates itself (winget can drive it where a manifest exists) | ❌ detect and notify |
| Portable application | Beyond Compare, Apifox | manual download | ❌ link only |
| Command-line fallback (universal) | any tool with a command line | the command you write in the config | depends on the config |

Adding an application is a config change, not a code change; an ecosystem that is not installed here yet is one row in the manager table. Not sure where to start? `[发现应用]` lists candidates with their installed versions and evidence, and you tick the ones to manage.

**For:** a machine running several CLIs, global npm packages, Chocolatey packages, and self-updating desktop applications at once, where keeping up means remembering five command families and cleaning up means reading `%TEMP%` by hand.
**Not:** a package manager (`choco` and `npm` still run their own commands), a cross-platform tool, or an app store — and it **never** runs a desktop application's installer.

---

## 📑 Contents

- [What this is](#what-this-is)
- [✨ Highlights](#-highlights)
- [🧩 Features](#-features)
- [🏗 How it works](#-how-it-works)
- [🗺 Milestones](#-milestones)
- [📦 Download and install](#-download-and-install)
- [🧰 Quick start (from source)](#-quick-start-from-source)
- [❓ FAQ](#-faq)
- [🔒 Security and privacy](#-security-and-privacy)
- [🧑‍💻 Development guide](#-development-guide)
- [📚 Documentation map](#-documentation-map)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Highlights

- 🎛️ **Anything can be managed** — winget / npm / pnpm / choco / uv / dotnet / pip ecosystems, self-updating desktop applications, portable applications, and anything expressible as a command; adding an application is config, and `[发现应用]` brings candidates to you.
- 🖐️ **You start everything** — no automatic scan, no background polling, no pre-ticked rows: opening the window shows the previous result and how old it is, and an update target is always one you ticked.
- ⚡ **Batch updates that report honestly** — per-row progress, one failure never takes down the batch, each process gets its own timeout, and cancel kills the whole process tree.
- 🧹 **Preview before anything is deleted** — declarative glob rules with a process guard and stale-version comparison, and a "what, and how many bytes" list first.
- 🛡️ **Deletion you can audit** — dry run by default, only glob-matched entries, login state explicitly protected, and the installed version never swept up.
- 🔌 **The proxy reaches only the child process** — read from the registry every run, never written back, never exported to the parent, never a hardcoded port.

---

## 🧩 Features

Seven panels: **applications** (versions and state badges; one failing row leaves the others alone), **progress and log** (phase, throughput, ETA, exit code, and a log one click away from a failed row), **cleanup** (match count and byte total per rule, nothing happens until you confirm), **settings** (proxy, concurrency, timeout, retention, UAC policy), **history** (one append-only JSONL record per action), **notifications** (a settled run), and **add application** (discovery candidates → tick to adopt → written only to the user-level `apps.yaml`). Panel rules and badges: [docs/ui.md](docs/ui.md).

Cleanup's three hard rules: **only glob-matched entries**, **a running target skips the whole rule**, **dry run by default** — semantics and the review checklist are in [docs/cleanup-rules.md](docs/cleanup-rules.md). Every update is verified to have actually changed the version, or it is recorded as `verify failed` with its rollback copy kept.

---

## 🏗 How it works

```txt
UI (React)      seven panels: renders state, sends plans
   │  IPC       Tauri commands + events (scan://progress …)
Core (Rust)     config → scan → plan → exec → verify → clean → history
   │            providers/* one file per mechanism + the manager table · platform/* the only Win32, registry, process code
On disk         %LOCALAPPDATA%\Upkeep: state.json · history.jsonl · logs/ · rollback/
```

One rule runs through all of it: **side effects exist only in Core, and every mutating operation is plan → preview → execute** — the button you click executes the plan you were just shown. Full layering, stage contracts, and IPC tables: [docs/architecture.md](docs/architecture.md).

---

## 🗺 Milestones

| Phase | Delivers | Acceptance |
|---|---|---|
| **M0** | Toolchain and Tauri scaffold | `pnpm tauri dev` opens a window |
| **M1** | **Read-only** scan, application list, version comparison, history, notifications | Every version correct; nothing on disk modified (proven by hashes) |
| **M2** | Batch update (self-updating CLIs + global npm) with live progress and proxy injection | `omp` / `pi` upgrade in one click; no proxy residue in the parent; failure isolation works |
| **M3** | Cleanup engine and rollback | The manifest checks out; the reclaimed total is quantifiable; zero damage to login state or the installed version |
| **M4** | Chocolatey (UAC), desktop-application links, portable-application links, settings | Elevation completes; desktop applications are notified about, never updated |
| **M5** | Universal adoption: the manager table (winget first), the `declarative` form, discovery candidates | A winget-upgradeable application is adopted in one click; adding an application is a config change; discovery writes nothing until the user confirms |

Required evidence: [docs/testing.md](docs/testing.md). Full acceptance criteria: [DESIGN.md](DESIGN.md#8-里程碑与验收标准).

---

## 📦 Download and install

**No release yet.** M0 produces installers through `pnpm tauri build` (NSIS / MSI). The build is unsigned, so SmartScreen warns on first run — the same situation as the other self-updating tools on this machine.

Prerequisites, already verified here: Windows 11 x64 · MSVC 14.44 + VS2019 BuildTools · Windows SDK 19041+ · WebView2 153 · Node 24 / npm 12 · Rust toolchain rustup 1.29 / rustc 1.98 (`stable-x86_64-pc-windows-msvc`, installed in the default location under the user profile) · 123 GB free on G:, 2.4 GB of it now the Cargo target directory.

> ⚠️ `rustup` and `cargo` do **not** read the Windows system proxy: installing the toolchain needs `HTTPS_PROXY` exported for that process, and crates come from the rsproxy mirror (`~/.cargo/config.toml`). Procedure: [docs/development.md](docs/development.md#bootstrap-without-a-working-system-proxy).

---

## 🧰 Quick start (from source)

The toolchain and the scaffold are in place; start here when setting the project up from scratch on a new machine.

```powershell
# Only needed to install the toolchain: rustup/cargo ignore the system proxy,
# so read it from the registry and export it for that process
$proxy = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer
$env:HTTPS_PROXY = "http://$proxy"; $env:HTTP_PROXY = $env:HTTPS_PROXY

git clone https://github.com/JESVN/upkeeper.git
cd upkeeper
pnpm install
pnpm tauri dev
```

Day to day: `pnpm tauri build` to bundle · `pnpm typecheck` / `pnpm test` for the frontend · `cargo fmt --check` / `cargo clippy -- -D warnings` / `cargo test` inside `src-tauri/` · `pnpm run doc-budgets` / `check-links` / `notes-format` for the documentation gates.

---

## ❓ FAQ

**Will it update desktop applications like PiDeck or CC Switch for me?** No, and that is a deliberate refusal: a desktop application's updater writes inside its own install directory, so stepping in means racing it for the same files — to save one click.

**Can cleanup delete my login state or configuration?** No. Only glob-matched entries are removed (never a directory swept wholesale), a running target skips the entire rule, state directories are declared with `protect`, and dry run shows the list first. A directory whose nature is undecided — `%LOCALAPPDATA%\com.ccswitch.desktop` is the current example — stays out of every rule.

**topgrade / UniGetUI / Scoop already update things. Why another tool?** None of them covers the other half: the largest residue comes precisely from desktop applications no package manager installed.

**Does it need administrator rights?** Only Chocolatey operations do, with one announced UAC prompt. `uac: mark-only` hands you the command instead of prompting.

**Does it collect my data?** No account, no telemetry, no cloud.

**How do I diagnose a problem?** Every application gets its own log per run under `%LOCALAPPDATA%\Upkeep\logs\`, openable from the failed row. When a rule disagrees with an existing script such as `omp-clean.ps1`, that is treated as a bug.

---

## 🔒 Security and privacy

- The proxy is injected per child process: read from the registry every run, never written back, never exported to the parent, no hardcoded port.
- Children never see a TTY — stdin is always null and ANSI escapes are stripped before output reaches a log or the UI; elevated results come back through a temp file, because UAC severs the pipe.
- `state.json`, `history.jsonl`, logs, and rollback copies live in `%LOCALAPPDATA%\Upkeep` and are never committed.

---

## 🧑‍💻 Development guide

Read [AGENTS.md](AGENTS.md) (the standing orders, Chinese) and [docs/architecture.md](docs/architecture.md) before changing anything. Three hard requirements:

- Nothing unverified enters [config/apps.yaml](config/apps.yaml): a version source without a confirming probe stays `# TBD` and renders as `unknown`, never as a guess.
- A non-trivial change adds an [Agent Note](.agents/notes/README.md) in the same change, and documentation moves with the code.
- A change that deletes files goes through [cleanup-safety-review](.agents/skills/upkeeper-cleanup-safety-review/SKILL.md) first; before pushing, follow [pre-push-checks](.agents/skills/upkeeper-pre-push-checks/SKILL.md) and report "not run" as such.

---

## 📚 Documentation map

| To learn about | Read |
|---|---|
| Standing orders, the design record, prior art | [AGENTS.md](AGENTS.md) · [DESIGN.md](DESIGN.md) |
| Layering, the seven-stage pipeline, IPC tables | [docs/architecture.md](docs/architecture.md) |
| Measured machine facts: inventory, paths, residue, proxy behaviour | [docs/environment.md](docs/environment.md) |
| Execution safety and cleanup rules | [docs/execution-safety.md](docs/execution-safety.md) · [docs/cleanup-rules.md](docs/cleanup-rules.md) |
| Config fields, the provider contract, UI, workflow, evidence | [docs/config-schema.md](docs/config-schema.md) · [docs/providers.md](docs/providers.md) · [docs/ui.md](docs/ui.md) · [docs/development.md](docs/development.md) · [docs/testing.md](docs/testing.md) |
| How-tos, failure stories, the application registry | [docs/cookbook/](docs/cookbook/README.md) · [docs/postmortem/](docs/postmortem/README.md) · [config/apps.yaml](config/apps.yaml) |

---

## 🤝 Contributing

Issues and pull requests are welcome. Read [AGENTS.md](AGENTS.md) first — those rules are boundaries, not style preferences. Bring the evidence with the change (a new cleanup rule needs its measured byte total, a new version source needs its probe result). If a rule is wrong, overturn it — but say why in `.agents/notes/` rather than working around it quietly.

---

## 📄 License

There is no `LICENSE` file, so all rights are reserved by default. Letting others reuse, modify, or redistribute it requires adding a license first.
