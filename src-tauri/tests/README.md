# `src-tauri/tests/`

Integration tests over the whole pipeline. They run against a temporary `UPKEEP_HOME` and fixtures they build themselves, so they can be run on any machine without touching real residue, real history, or an installed application.

What a pipeline test looks like:

1. Create a temp home and write an `apps.yaml` that points at the fixture.
2. Build the fixture tree — a fake executable, a residue directory, a protected subtree, and optionally a file held open by a handle to simulate a lock.
3. Run the stage under test and assert on the observable result: the `Outcome`, the history record, the files that survived, and the bytes accounted.
4. Assert the refusals as well: the process guard skipping the whole rule, a relative glob rejected at load, a plan that tries to widen itself, a proxy value that must not reach the test process's environment.

Rules:

- No test reads or writes `%LOCALAPPDATA%\Upkeep`, and no test deletes anything outside its temp directory.
- A destructive test uses `dry_run: true` unless the entire target is inside the fixture.
- Fixtures are constructed in code, not committed as directory trees, because only a constructed fixture can hold a locked file or a size worth asserting.
- A test that only passes when run alone is a defect to fix, not a test to isolate.
- Assertions name the path, version, or exit code they disagreed with, so a failure during a real run carries its own evidence.
