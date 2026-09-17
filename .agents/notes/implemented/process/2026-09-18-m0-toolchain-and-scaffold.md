# Agent Note: M0 — the toolchain, the Tauri scaffold, and three documentation gates

Status: implemented

## Problem

M0 has to produce a window that opens, from a repository that declared its directory tree before it had any code: `src/` and `src-tauri/` carry ownership READMEs, subtree `AGENTS.md` files, and empty `features/`, `providers/`, `core/` folders, and [docs/development.md](../../../../docs/development.md) requires the generated files to land inside them rather than in a new subproject folder.

Two constraints made the install itself the risky part. `rustup` and `cargo` ignore the Windows system proxy ([measured](../../../../docs/environment.md#proxy-behaviour-by-tool)), on a machine whose system proxy runs on a port that moves when the proxy restarts — so a bootstrap has to survive both the proxy and its port change. And the documentation standard referred to three gates (`scripts/doc-budgets.mjs`, `check-links.mjs`, `notes-format.mjs`) that did not exist, so its ceilings and its link rule were enforced by hand.

## Decision

**Toolchain.** `winget install Rustlang.Rustup` installs rustup 1.29.1 with `HTTPS_PROXY`/`HTTP_PROXY` exported in the invoking shell, and rustup then installs `stable-x86_64-pc-windows-msvc` (rustc/cargo 1.98.1, with clippy, rustfmt, rust-docs). `RUSTUP_HOME` and `CARGO_HOME` stay at their defaults under the user profile, as [docs/environment.md](../../../../docs/environment.md#where-rust-keeps-its-files) argues: space is not the constraint and C: is the faster disk.

**Mirror rather than proxy for crates.** `%USERPROFILE%\.cargo\config.toml` replaces `crates-io` with the rsproxy sparse index and sets `git-fetch-with-cli = true`. A mirror survives a proxy port change, which an exported `HTTPS_PROXY` does not.

**The scaffold is merged, not nested.** `create-tauri-app` 4.7.4 generates the shell in a temporary directory (`--template react-ts --manager pnpm --identifier com.jesvn.upkeep --tauri-version 2`); its files move into the root (`package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`), `src/` (the React entry `main.tsx`/`App.tsx`, `styles/tailwind.css`, `lib/copy.ts`), and `src-tauri/` (`Cargo.toml`, `tauri.conf.json`, `build.rs`, `capabilities/`, `icons/`), leaving every pre-existing README and `AGENTS.md` in place.

**One Tailwind entry with both modes in it.** `src/styles/tailwind.css` imports Tailwind v4 through the `@tailwindcss/vite` plugin, declares the shell's tokens in `@theme`, and overrides the colour values inside `@media (prefers-color-scheme: dark)`. This answers the open question recorded in [`.agents/progress.md`](../../../progress.md): a second file per mode is not needed, and one file makes it impossible for a token to exist in one mode only. The full token set — the six state colours and the system-accent correction layer — is still owned by the visual identity document that [docs/style-direction.md](../../../../docs/style-direction.md) names, so this file declares only what the shell renders today, at the values that direction already fixed.

**Windows-only crate shape.** `crate-type = ["rlib"]` and no `#[cfg_attr(mobile, …)]` entry point: the repository's first standing rule is that cross-platform branches do not get written. `main.rs` stays a thin call into `upkeep_lib::run()`, which is what lets `tests/` exercise the module tree without Tauri. The notification and opener plugins are registered now because [DESIGN.md](../../../../DESIGN.md#7-技术栈与依赖) puts them in the stack; their permissions are the only entries in `capabilities/default.json` beyond `core:default`.

**Window and identity.** `productName` and the window title are `Upkeep`, identifier `com.jesvn.upkeep`, bundle targets `nsis` and `msi`, window 1080×720 with a 760×520 minimum, and the native decorated frame for now — the custom title bar and Mica of the visual direction land with the visual identity, and an undecorated window without drawn window controls would be a worse shell than a decorated one.

**Three gates, each reading its rule from the document that owns it.** `scripts/doc-budgets.mjs` parses the ceiling table out of [docs/AGENTS.md](../../../../docs/AGENTS.md#word-budgets) and counts word-equivalents (CJK at 0.6, markup and link targets excluded) so a ceiling has exactly one home. `scripts/check-links.mjs` resolves every relative Markdown link and fragment, reproducing GitHub's slug rules including the leading hyphen an emoji heading produces and the `-1` suffix a repeated heading gets. `scripts/notes-format.mjs` checks a note's path, header, status-versus-folder agreement, archived date, and the sections its lifecycle requires, from [.agents/notes/README.md](../../../notes/README.md). `package.json` exposes them as `doc-budgets`, `check-links`, and `notes-format` beside `typecheck` and `test`.

## Alternatives considered

- **Hand-writing the scaffold instead of generating it.** Rejected: the generated icons and a configuration the Tauri toolchain is known to accept come for free, and a hand-written `tauri.conf.json` is a debugging session rather than a saving.
- **A frontend subdirectory (`app/`) beside `src-tauri/`.** Rejected: the repository already declares `src/` as the frontend root with its own ownership map, and `pnpm tauri dev` is documented to run from the repository root.
- **Two theme files, one per mode.** Rejected: a token could then exist in one mode only, and selecting between files needs a build-time switch that the `prefers-color-scheme` media query already performs at runtime.
- **Keeping the system-proxy-only path and exporting `HTTPS_PROXY` for every build.** Rejected: the port moves when the proxy restarts, so every future build would fail for a reason unrelated to the code.
- **Gate scripts as inline `node -e` commands in `package.json`.** Rejected: unreadable, and the slug and ceiling rules need real tests of their own.
- **Fixing the survey note so `notes-format` passes on the day it lands.** Not taken: the note is a decision record whose missing `## Proposal` section is either a note to reshape or a standard to amend, and that is a call for the repository's author. The gate reports it instead (`notes-format` exits 1 with that single finding), and it is recorded as an open item in [`.agents/progress.md`](../../../progress.md).
- **`vitest` added only when the first test is written.** Rejected: `pnpm test` is documented as part of the M0 command surface, so it exists now with `passWithNoTests`, and it says out loud that it ran no tests.

## Consequences

- The first `cargo build` compiles the whole Tauri dependency graph into `src-tauri/target` (2.4 GB) and takes 1m39s through the mirror; `cargo build` afterwards is incremental, and `src-tauri/target` is gitignored and must never be committed or cleaned by an Upkeep rule.
- `docs/development.md`'s bootstrap procedure is now history for this machine and procedure for the next one: the proxy export is needed to install a toolchain, not to build.
- `pnpm test` currently exits 0 having run no test file. It is a lane, not evidence, and `docs/testing.md` still owns what M1 must prove.
- The three gates are only as good as their inputs: `doc-budgets` fails when a ceiling row matches no file, and `check-links` reports a broken link rather than skipping it, so a red gate names the file and line.
- `notes-format` is red until the survey-note question is settled. No other gate has a known deviation.
- The app icon is still the Tauri default: an icon is a visual-identity asset, and that document is not written yet.

## Verification

Run on 2026-09-18, in the repository root unless stated:

| Command | Result |
|---|---|
| `pnpm install` | 64 packages; react 19.3.0, vite 8.3.0, tailwindcss 4.3.3, @tauri-apps/cli 2.11.4, vitest 5.0.1 |
| `pnpm typecheck` | exit 0 |
| `pnpm build` | `dist/index.html` 0.39 kB, CSS 9.44 kB, JS 220.36 kB |
| `cargo build` (in `src-tauri/`) | `Finished dev profile … in 1m 39s`, exit 0 |
| `pnpm tauri dev` | window titled `Upkeep`, non-zero `MainWindowHandle`, 10 s after launch; the process tree was then killed and no `upkeep.exe` remained |
| `pnpm run doc-budgets` | PASS; every document under its ceiling, the tightest being the handoff skill at 8% headroom |
| `pnpm run check-links` | PASS — 370 links in 56 files |
| `pnpm run notes-format` | FAIL — one finding: `proposed/architecture/2026-09-17-ui-reference-survey.md` has no `## Proposal` section |
| `pnpm test` | exit 0, `No test files found` |
| `git status --short` | only source files; `dist/`, `node_modules/`, and `src-tauri/target/` are ignored, so M0's "no build artifact inside a tracked source directory" holds |
