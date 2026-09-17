---
name: upkeeper-pre-push-checks
description: Use before pushing an Upkeep change, before marking work complete, or whenever tempted to say a check passed — selects the smallest locally runnable evidence that covers the diff and refuses to claim checks that do not exist. Covers Rust core and provider changes, frontend changes, cleanup-rule changes, config schema changes, and documentation-only changes.
---

# Upkeeper pre-push checks

Upkeep has no CI. Everything that is verified, is verified locally, by the command that was actually run. The failure this skill prevents is a green-sounding summary that no command produced.

## Establish what exists

Before selecting checks, confirm the repository can run them at all.

```sh
git status --short --branch
ls src-tauri/Cargo.toml package.json 2>/dev/null
```

M0 put the toolchain, `src-tauri/Cargo.toml`, and the `package.json` command surface in place, so a missing one is a broken checkout rather than an unstarted milestone: say which check could not run and why instead of reporting a build that never happened.

## Select the narrowest evidence

Match the check to the surface the change actually reaches.

- **Rust core, a stage, or the trait** — `cargo test <module>` plus `cargo fmt --check` and `cargo clippy -- -D warnings`. A change to `plan`, glob matching, config validation, or proxy resolution also needs its owning unit test, because those are the paths the safety rules depend on.
- **A provider** — the provider's own tests, then one scan against the real tool for the version it reports. A provider change that only compiles has proved nothing about detection.
- **Anything destructible** — the dry-run comparison in [testing.md](../../../docs/testing.md) for the affected rule, plus a fixture test covering the guard and `protect`. Never exercise the real target as the first run.
- **Frontend** — `pnpm typecheck` and the owning `*.test.ts(x)`. A view-model change also needs a check of the badge or label it selects, since those names are contracts in [ui.md](../../../docs/ui.md).
- **Config schema or `apps.yaml`** — validation on load with the shipped file, plus one deliberately invalid entry to confirm it fails loud rather than skipping the app.
- **Docs, Agent Notes, or a subtree README** — the [upkeeper-doc](../upkeeper-doc/SKILL.md) audit for placement, duplication, and budgets. No build is required, and claiming one adds noise.
- **Packaging, installer, or notification identity** — `pnpm tauri build` and one run of the produced binary, because a toast that silently does not appear is the failure mode here.

## Report honestly

- Name the command and its result. "Not run" is a legitimate entry and is always better than an implied pass.
- A skipped or `#[ignore]`d test is reported as skipped, never folded into a pass.
- A manual acceptance step that was not performed is listed as outstanding, not implied by a nearby automated check.
- When a check could not run — no toolchain, no network, no UAC prompt available — say which one and why, so the gap is visible to the next reader.

## Do not

- Do not re-run a passing check for the same commit.
- Do not run the whole suite for a local change unless the change is repository-wide or the user asked.
- Do not weaken a test to make a change pass; change the behaviour or change the test deliberately, with the reason in the same change.
