# Testing

What each milestone must prove, where tests live, and what a test may touch. Nothing here runs in CI yet; every check is run locally and must be reported by the command that actually ran, never by a claim that it would pass.

## Layout

| Lane | Location | Covers |
|---|---|---|
| Rust unit | `#[cfg(test)]` beside the module | Pure logic: glob matching, filter precedence, version comparison, config validation, path expansion |
| Rust integration | `src-tauri/tests/` | The pipeline against a temp `UPKEEP_HOME`: config → scan → plan → exec → verify → clean → history, including the process guard and the elevation handoff |
| Frontend unit | `src/**/*.test.ts(x)` | View models, badge and label selection, copy keys, IPC wrapper typing |
| Manual acceptance | Per milestone below | Anything that needs a real installer, a real UAC prompt, or the real residue |

Fixtures are created by the test into a temp directory, never committed as a directory tree: only a built fixture can contain a locked file, a size that matters, or a path that differs per machine. Never point a test at a real application directory or at the real `%LOCALAPPDATA%\Upkeep`; `UPKEEP_HOME` exists for that reason.

Network-dependent probes are skipped unless an environment flag is set, and a skipped probe is reported as skipped rather than passed. A test that passes only when it runs alone is a defect in the test.

## Required evidence per milestone

| Milestone | Evidence |
|---|---|
| M0 | `cargo build` completes; `pnpm tauri dev` opens a window; no build artifact appears inside a tracked source directory |
| M1 | Every configured application reports the version its own tool reports (compare against `--version`, `npm ls -g`, `choco outdated`, exe properties); a scan is proven read-only by hashing the tracked trees and the managed application directories before and after, with the two hash sets equal; launching the built app creates no child process and makes no outbound request until `[检查更新]` is clicked, rendering only the recorded `state.json` and its age; a single-row refresh runs that application's provider alone and leaves every other row's recorded state untouched |
| M2 | omp and pi each go from their installed version to the latest in one run; only the ticked rows are updated, and an application with an available update that the user did not tick is untouched; `HTTPS_PROXY`/`HTTP_PROXY` are absent from the parent environment before and after; a deliberately broken entry fails alone while its siblings succeed; a child that would block on stdin exits non-zero instead of hanging; a timeout produces `failed` with the log path recorded |
| M3 | A dry-run plan's per-rule byte total matches a manual `Measure-Object` of the same paths, with any difference explained; execution removes exactly the previewed paths, and the freed total is computed from the deletion results; a protected subtree (browser profile `Default`) and the current version's natives are byte-identical afterwards; with a guarded process running, the rule reports `skipped` and removes nothing |
| M4 | A choco upgrade completes through the elevated helper with its output recovered from the temp JSONL and present in the run log; dismissing the UAC prompt records `skipped`, not a crash; a desktop application row spawns no installer process and writes nothing inside its install directory |

The M1 read-only proof and the M3 dry-run comparison are the two claims this project exists to make honestly: the scanner must be provably harmless, and cleanup must be provably bounded by its preview. A change that weakens either one needs the strongest available evidence, not the fastest.

## Writing a test

- **Assert behaviour, not implementation.** A cleanup test asserts which paths were removed and which survived, not that a particular internal function was called.
- **Cover the refusal paths.** Every safety rule has a test that would fail if the rule were removed: a running guard, a protected subtree, a relative glob, a plan that tries to widen itself, a proxy that must not reach the parent environment, an application that must not be updated because it was never ticked, and a first launch that must spawn nothing.
- **Make failure output useful.** A failing assertion names the path, the version, or the exit code it disagreed with; "expected true, got false" wastes the one run that had the evidence.
- **Keep tests deterministic.** Fixed versions in fixtures, no live registry call, no dependency on what is installed on the developer's machine except in the manual acceptance rows.
- **A test for a destructive path uses `dry_run: true` unless it operates entirely inside a temp fixture.** A test that deletes real residue is a bug with a green checkmark.
- **Record what was skipped and why**, so a green run is distinguishable from a run that never exercised the path.
