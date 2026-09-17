# Adding an application, a manager, or a mechanism

Three different costs, in increasing order. Pick the smallest one that works: almost every request lands in step 1. The contracts are in [providers.md](../providers.md); the field reference is in [config-schema.md](../config-schema.md).

## 1. An application — config only

1. **Find out whether it is already known.** Run `[发现应用]` (`discover`): if the application appears as a candidate — winget, an ecosystem manager, or a registry entry — adopting it writes the entry for you. Otherwise continue by hand.

   *Verify:* the candidate lists an installed version and an evidence source, or the app is genuinely absent from every listing.

2. **Pick the mechanism from what actually updates it.** A manager id → `manager`; its own `update` command → `self-update-cli`; it updates itself in its own window → `external-ui`; portable with no updater → `green`; anything else with a command line → `declarative`. Never `external-ui` for something Upkeep could update safely, and never `manager` for something that has no manifest.

   *Verify:* the mechanism's update path matches how the tool updates itself today, checked by running that update command once by hand.

3. **Give it a source chain**, most reliable first: the manager's own listing, the tool's check command, a GitHub release, then the vendor page. One source is fine when it is the right one; a `# TBD` stays marked until a probe confirms it ([procedure](verifying-a-release-source.md)).

   *Verify:* the chain's first working source returns the version the tool itself reports for a release you already know.

4. **Add the entry** to [config/apps.yaml](../../config/apps.yaml) (or to the user-level `%LOCALAPPDATA%\Upkeep\apps.yaml` when it is personal) with `id`, `form`, and the mechanism's keys.

   *Verify:* `plan_update` refuses the entry for a missing required key at load, and a scan reports a real version or an explicit `unknown`.

5. **Add cleanup rules only when the app leaves residue** you have measured, following [adding-a-cleanup-rule.md](adding-a-cleanup-rule.md).

   *Verify:* the rule's preview matches a manual measurement of the same paths.

No code changes, and no provider file, for any of the above.

## 2. A manager — one table row

Use this when the application is installed by a package or ecosystem manager that is not in the table yet (scoop, pipx, bun, yarn, cargo, nuget…). The manager table lives in `src-tauri/src/providers/managers.rs`; [providers.md](../providers.md#managers) lists the columns.

1. **Run the manager's listing and upgrade commands on this machine** before writing anything: the listing command and the field the version lives in, the upgrade template, whether it needs elevation, and which flags keep it non-interactive.

   *Verify:* the listing output is captured, and the version it reports matches the tool's own `--version`.

2. **Add the row**, with the listing command and parser, the upgrade template, the id field, elevation, proxy, and silence flags.

   *Verify:* a scan using the new row reports the installed version for one real app; a manager that is not installed reports a finding rather than an error.

3. **Do not invent a row for a manager you have not run.** A row written from documentation is an executable claim nobody verified; it lands together with the first application that needs it.

   *Verify:* every command in the row has been executed at least once, and the note says so.

## 3. A mechanism — a provider file, rarely

Only when the update path is genuinely new (nothing in the manager table, no update command of its own, not a self-updating GUI application, not portable). This changes the trait, the UI grouping, and the rollback matrix, so it needs an [Agent Note](../../.agents/notes/README.md) before code.

1. **Write the provider** at `src-tauri/src/providers/<mechanism>.rs`, implementing the trait in the order of its contracts: `detect` reads only, `latest` walks the chain, `plan` does no I/O, `update` performs exactly the plan, `cleanup_rules` returns what the config declares, `rollback` reports `Unsupported` unless a real path exists.

   *Verify:* a unit test calls `plan` with a fake `Installed` and asserts the flags without starting a child process.

2. **Add the `Form` variant, the registry arm, the UI label,** and the mechanism's row in [providers.md](../providers.md).

   *Verify:* the registry builds a config that mentions only this mechanism, and the row renders with the correct badge and rollback label.

3. **Test the refusals**: missing executable → `NotInstalled` (absent row), probe timeout → only this row `failed`, non-interactive child never waits on stdin.

   *Verify:* `cargo test` covers all three, and the timeout test asserts its siblings still report.
