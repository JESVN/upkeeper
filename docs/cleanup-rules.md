# Cleanup rules

Cleanup reclaims what updaters leave behind. It is a separate pipeline from updating: it matches filesystem entries rather than applications, and it is the only place in Upkeep that deletes something. Field names, types, and defaults are in [config-schema.md](config-schema.md#cleanup-rule-fields); measured sizes are in [environment.md](environment.md#update-residue).

## The three hard rules

1. **Delete only what a glob matched.** The glob is the allowlist. A matched directory may be removed with its contents; a parent, sibling, or path reached by walking upward may not, even when it is empty and obviously disposable. A rule that matches files removes files.
2. **A running target skips the whole rule.** If `skip_if_running` names a process that exists, the rule reports `skipped` and removes nothing — not the files that happen to be unlocked. A running updater is writing into exactly the directories a rule is about to remove.
3. **Dry run is the default.** `plan_clean` produces the full path list and byte total; `run_clean` requires the confirmed path list from that plan. There is no "just do it" entry point, and a plan never widens itself at execution time.

## Matching

A rule is evaluated at execution time against the live filesystem, after `%VAR%` expansion, and every step is reported so a skip can be explained:

```
guard (skip_if_running) → quiet_period → glob match → filters → byte accounting
  → preview → delete per entry → per-entry result
```

Filters, applied in this order:

- `only` restricts the matched set to the named first-level children of a matched directory. Anything not listed is invisible to the rule, so a new file appearing in that directory is preserved by default rather than swept up.
- `protect` removes subtrees from the matched set unconditionally and wins over `only`. A protected path is never walked for accounting either, so it cannot appear in a preview.
- `keep_newest` keeps the N most recently written matched entries and removes the rest.
- `older_than_days` keeps entries written within that window.
- `keep_matching_version` keeps the entry whose name matches the currently installed version and removes the others; the provider supplies the version, not the rule.
- `quiet_period_s` skips entries written within that many seconds. A rule that fires while an updater is mid-write is indistinguishable from a bug.

Byte accounting counts file lengths for exactly the entries that will be removed; directories contribute nothing, so the UI total is a floor on what Windows will free, never an exaggeration.

## Reporting

- A preview lists every path, grouped by rule, with per-rule and total byte counts.
- Removal is per entry: one failure (a lock, a permission denial, an unexpected type change) is reported with its path and OS error and does not stop the rest of the rule.
- An entry that disappeared between preview and execution is reported as `gone`, not as a failure.
- The history record carries `freed_bytes` computed from the entries actually removed, so a claimed total is always verified by the deletion result rather than by the plan.
- `skip_if_running` and `quiet_period_s` skips appear in the UI with the reason, so "nothing to clean" is never confused with "skipped".

## Reviewing a change to cleanup

Cleanup changes need the widest blast radius review in the project; [upkeeper-cleanup-safety-review](../.agents/skills/upkeeper-cleanup-safety-review/SKILL.md) runs this list.

- **Is the glob anchored?** Prefer a full path with a narrow wildcard over a bare name; a glob that can match outside its intended directory is disqualifying.
- **Does the rule delete something that can be re-created only by re-downloading?** If the artifact is the only copy of anything a user typed, the rule is wrong.
- **Are state directories excluded?** Login sessions, browser profiles, databases, and configuration are protected explicitly; `com.ccswitch.desktop` is unclassified and stays out until [environment.md](environment.md#update-residue) records what it is.
- **Does the guard name every process that writes there?** Include the updater, the tray process, and the helper a tool spawns.
- **Is the current version protected?** A stale-version rule must compare against the version the provider detected in the same run, never against a cached value.
- **Is the regression test a fixture, not this machine?** The rule is exercised against a copied directory tree, including a locked file and a protected subtree, so the test asserts the guard and the filters rather than the state of the developer's disk.
- **What is the first run's expected reclaim?** A rule that cannot state a plausible size in the preview is matching the wrong thing.

## Related

- The rule inventory is [config/apps.yaml](../config/apps.yaml); the measured sizes it targets are in [environment.md](environment.md#update-residue).
- The procedure for adding one is [adding-a-cleanup-rule.md](cookbook/adding-a-cleanup-rule.md).
- The process guard and deletion-after-settle requirements are shared with [execution-safety.md](execution-safety.md#process-guard).
