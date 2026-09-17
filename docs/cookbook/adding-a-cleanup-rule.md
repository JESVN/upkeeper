# Adding a cleanup rule

Cleanup is the only part of Upkeep that destroys data, so this guide is deliberately slower than the size of the change suggests. Read [cleanup-rules.md](../cleanup-rules.md) — including the three hard rules and the review checklist — before starting.

1. **Measure the target before writing anything.** Record which paths match, how many, and the total size. A rule nobody measured has no expected reclaim, and a preview without an expectation cannot be judged.

   ```powershell
   Get-ChildItem "$env:TEMP\CC Switch-*-updater-*" -Force |
     Measure-Object -Property Length -Sum
   ```

   *Verify:* the numbers are written down before the rule exists, so the first preview can be compared against something other than itself.

2. **Write the narrowest glob that matches exactly that set.** Absolute after `%VAR%` expansion, with wildcards only where the measured names vary. A glob that could match a sibling directory or a user file is wrong even if it happens to match correctly today.

   *Verify:* list the matched paths and read them one by one; every one should be an artifact a tool created, and none should contain anything a user typed.

3. **Decide whether the target is a directory or a set of entries inside one.** A rule that matches a directory removes it with its contents; a rule that matches entries removes only what it matched. Choose the one that describes the measurement.

   *Verify:* the rule's filter combination is expressible in the [field table](../config-schema.md#cleanup-rule-fields) with no new key. A rule that needs a new key is a schema change and needs an [Agent Note](../../.agents/notes/README.md).

4. **Add the filters that make it safe.** `protect` for anything holding state — a browser profile's `Default`, a database, a config file — and `only` when the directory contains both disposable cache and content that must survive.

   *Verify:* in the preview, no protected path appears. `protect` beats `only`, so a path intentionally in both is a config error, not a judgement call.

5. **Name every process that writes there** in `skip_if_running`: the application, its updater, and any helper it spawns.

   *Verify:* with each named process started manually, `plan_clean` reports `skipped` and the matched count is zero — not a smaller count.

6. **Set `quiet_period_s` for anything an updater writes into.** It is the only defence against deleting a directory that an in-flight update just created.

   *Verify:* touch a file matching the glob, run the plan immediately, and confirm the entry is excluded with a quiet-period reason.

7. **Add the rule to the owning app's `cleanup` list** in [config/apps.yaml](../../config/apps.yaml), not to a global list.

   *Verify:* the rule's id appears in the cleanup panel under that app, with the byte total from step 1 inside an explainable margin.

8. **Test it on a fixture**, in `src-tauri/tests/`: build the tree in a temp directory, including a locked file and a protected subtree, and assert what survived.

   *Verify:* `cargo test` covers (a) the plain removal set, (b) the guard skipping the whole rule, (c) `protect` surviving, (d) a locked entry reporting a per-path failure while its siblings are still removed.

9. **Dry-run against the real target, compare with the measurement, then execute once.** The difference between the preview and step 1 is either explained by a file created since the measurement or it is a bug.

   *Verify:* the freed total from the run equals the previewed total minus per-path failures, and each failure has an OS error. Update [environment.md](../environment.md#update-residue) with the measured result, because the numbers there are what the next rule is calibrated against.
