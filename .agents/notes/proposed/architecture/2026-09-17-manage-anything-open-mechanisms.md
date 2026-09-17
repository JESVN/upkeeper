# Agent Note: Manage anything — mechanisms, a manager table, a declarative fallback, and discovery

Status: proposed

## Problem

The v0.1 design modelled application forms as a closed set of five, one provider file each, and required a hand-written `apps.yaml` entry per application. That shape made the tool match the machine it was measured on and nothing else.

Two failures follow from it. First, "five forms" reads — and behaves — like a capability limit: an application whose update path is not one of the five cannot be managed at all, and every new application costs a Rust file, a trait implementation, and an [Agent Note](../../README.md). Second, there was no way to find out what is installed: the registry was written from one manual inventory, so a user had to already know an application's mechanism, path, and version source before Upkeep could do anything with it.

The requirement is the opposite: manage anything on the machine, including applications that did not exist when this design was written, without writing code per application.

The measurement that makes this tractable was not in the v0.1 survey at all. `winget` — shipped with Windows 11 as an execution alias — detects **459 applications** on this machine and reports **83 upgradeable**, with versions for applications that no package manager installed. It also covers ecosystems the original design would have grown a provider file per: the same machine has npm (26 global packages), pnpm, choco (9 pending), uv, dotnet tool, pip, and go installed.

## Proposal

Separate three things that were conflated: **mechanism**, **application**, **ecosystem**.

1. **Five mechanisms stay closed, applications do not.** `manager`, `self-update-cli`, `external-ui`, `green`, and `declarative`. Only a genuinely new *mechanism* adds a provider file; adding an application is a config entry.
2. **`manager` covers every package and ecosystem manager through one table row each** (`src-tauri/src/providers/managers.rs`): listing command and parser, upgrade command template, id field, elevation, proxy, non-interactive flags. winget, npm, pnpm, bun, yarn, scoop, choco, pip, pipx, uv, dotnet, cargo, and go all have the same shape, so they share one implementation. Adding an ecosystem is ~fifteen lines; a row for a manager that is not installed here is written with the first app that needs it and verified by running its commands, never copied from documentation.
3. **`declarative` is the zero-code fallback**: detect command and regex, source chain, update command and arguments, verification, and cleanup all live in `apps.yaml`. Anything with a command line is manageable, including tools this design has never heard of.
4. **`latest` becomes an ordered source chain.** A winget manifest is used when it exists; where it does not — the registry-only applications such as PiDeck, Cockpit Tools, and Tuanjie Cowork, which winget lists as `ARP\…` entries with a version but no available version — the chain falls through to a GitHub release or the vendor page. No single source becomes a dependency, and an application is never unmanageable merely because one feed is missing.
5. **`discover` and `adopt` remove the need to know a mechanism in advance.** `discover` is read-only and enumerates candidates from `winget list`, each manager's listing, the registry's uninstall entries, and executables under the program directories, with the evidence attached to each candidate. The user ticks what to manage; `adopt` appends those entries to the **user-level** `%LOCALAPPDATA%\Upkeep\apps.yaml`, and the shipped registry is never written by the application.
6. **winget is a managed mechanism, not a competitor.** It is what makes "manage anything" practical, and it is also insufficient on its own: it cannot upgrade an application it knows only from the Add/Remove entries, it does not know about self-updating CLIs, and it does not reclaim a single byte of updater residue — which remains the larger half of this project.

## Alternatives considered

- **One provider file per application.** Rejected: it makes the registry a code artifact, so every new tool is a code change, and it cannot cover the long tail at all.
- **winget only, drop the rest.** Rejected. It cannot upgrade the ARP-only applications, has nothing to say about `omp` / `pi` / `codex` / `claude` self-updates, treats npm/pnpm/uv/dotnet/pip tools inconsistently, and leaves the 661 MB of updater residue untouched.
- **Auto-adopt everything discovered.** Rejected on the same grounds as automatic scanning: 459 candidates is not a plan, an adopted entry with no usable source becomes a permanently `unknown` row, and managing an application is a decision the user makes. Discovery proposes; the user decides.
- **A universal heuristic instead of sources** (read the exe resource, then guess the vendor's page). Rejected: a version resource answers "installed", never "latest", and a guessed page produces wrong answers silently — which the registry's `# TBD` rule already forbids.
- **Declarative recipes only, no code** (`fp-appimage-updater`'s shape). Rejected as the whole design, for the reason recorded in the v0.1 note: proxy injection, elevation with output recovery, timeouts with process-tree cancellation, and guarded deletion are behaviour a YAML file cannot express. It is adopted as the *fallback*, where it is exactly right.

## Acceptance criteria

- **M5** — a winget-managed application adopted from a discovery candidate upgrades through winget with no code change; a `declarative` entry detects, updates, and verifies using only config; `discover` writes nothing until the user confirms and then appends only to the user-level file; a manager that is not installed is reported as a finding rather than failing the scan.
- Adding an application touches `apps.yaml` only; adding an ecosystem touches the manager table only; neither adds a provider file.
- A `latest` chain with a dead first source still resolves through the second.

Evidence requirements are in [docs/testing.md](../../../../docs/testing.md); the mechanism and manager contracts are in [docs/providers.md](../../../../docs/providers.md); the field reference is in [docs/config-schema.md](../../../../docs/config-schema.md).

## Risks

- **winget is reachable only as an execution alias** (`%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe`) and is absent from `PATH` and from `cmd`. The platform layer resolves the absolute alias path; if that fails, winget degrades to a discovery source rather than an update mechanism.
- **ARP-only applications stay notify-only.** winget can see their version but has nothing to upgrade them to; those entries keep an `external-ui` mechanism and a real source chain, and discovery labels them as such rather than promising an update path.
- **Discovery can produce hundreds of candidates.** The panel sorts and groups them (upgradeable first, unattended-capable first) and lists only what is not already managed, so the list is a shortlist rather than a dump.
- **Manager rows are executable claims.** A row written from documentation instead of a real run would fail at the worst moment; the rule is that a row lands with the first application that needs it and only after its commands have been executed on this machine.
