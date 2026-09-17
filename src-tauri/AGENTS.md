# AGENTS.md — Rust core

These rules supplement the repo-wide [conventions](../AGENTS.md#约定). The ownership map is [README.md](README.md); the stage contracts are in [docs/architecture.md](../docs/architecture.md).

- **`src/platform/` is the only module that calls an OS API.** No `unsafe`, no `windows`-crate call, no registry access outside it; every other module asks platform for the result. An `unsafe` block carries a comment naming the invariant it relies on.
- **One spawn helper.** Every child process goes through the single function in `platform` that sets `Stdio::null()` on stdin, builds the child environment explicitly, injects the resolved proxy when asked, and wraps the output in an ANSI-stripping reader. A second place that starts a process is a defect even if it works.
- **A provider never writes state, history, logs, or UI text.** It returns an `Outcome`; the `exec` and `history` stages persist it.
- **`commands/` holds no logic a test cannot reach.** A handler validates arguments, calls a `core` function, maps the result, and emits events. Anything conditional belongs in `core`, where `cargo test` can exercise it without Tauri.
- **`plan` is pure.** No I/O, no spawning, no clock or filesystem read inside `plan`; it takes the state it needs as arguments. This is what makes "the plan is what will happen" true.
- **`update` performs the plan it was given.** It never adds an argument, changes a target version, or starts an extra child; a plan that turns out to be wrong is a new plan, previewed again.
- **Errors are one enum.** Missing executable, unverified source, timeout, elevation refused, process guard hit, and verify failure are distinct variants carrying their evidence (app id, exit code, log path). A `String` error crossing a command boundary is not acceptable.
- **No panics on user data.** A missing file, a locked file, an unreadable config, a malformed version string, and a vanished process are all `Result`s. `unwrap` is acceptable only on a value that would make the program unable to start at all, and the comment says why.
- **`mod.rs` holds the trait, the form enum, and the registry only.** A provider-specific branch in the registry is a design error: the point of the trait is that `core` never asks which form it is talking to.
- **Deletion lives in one module** and only through the [cleanup rules](../docs/cleanup-rules.md); a `remove_file` or `remove_dir_all` elsewhere in the tree is a bug.
- **Tests use `UPKEEP_HOME` and temp fixtures.** No test deletes real residue, reads real history, or depends on what is installed on this machine except the manual acceptance steps in [testing.md](../docs/testing.md).
- **Concurrency is bounded, and every task is owned.** A spawned task has a handle the caller awaits or cancels; an unbounded `spawn` with no owner leaks a child process past the run that started it.
