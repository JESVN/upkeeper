---
name: upkeeper-cleanup-safety-review
description: Review any Upkeep change that deletes, moves, or truncates a file, or that could cause a deletion — a new or widened cleanup rule, a change to glob matching, filters, keep rules, guards, the preview, or the byte accounting. Use before merging such a change and before the first real execution of a new rule.
---

# Cleanup safety review

Deletion is the only irreversible thing Upkeep does. This skill is the review pass over [cleanup-rules.md](../../../docs/cleanup-rules.md); it assumes the change has tests and asks what could still be destroyed.

## The four questions

1. **What is the narrowest path this change can delete, and the widest?** Write both down. The widest must be exactly the measured target set; anything broader is disqualifying even if it matches correctly today.
2. **What does the user lose if it is wrong?** A cache costs a re-download. A profile, a session, a config file, or a database costs work that cannot be recovered. Name the category for every matched path.
3. **Which process could be writing there right now?** Every writer belongs in `skip_if_running`, including the tray process and any helper the updater spawns.
4. **How does the change behave while an update is in flight?** The answer must be "the rule skips", not "the file was probably complete".

## Walk the matching pipeline

Follow the execution order in [cleanup-rules.md](../../../docs/cleanup-rules.md#matching), asking at each step **the question that only a review asks** — the semantics themselves live in that document and are not restated here:

| Stage | What the review asks |
|---|---|
| guard | Does the list name every process that writes there, including the tray process and any helper the updater spawns? |
| `quiet_period_s` | Is this a directory an updater writes into? If it is and the rule has no quiet period, that is the defect. |
| glob | Can the changed glob still match outside its intended directory? Could the match count be stated before the rule was written? |
| `only` | Is a newly appearing file preserved by default? If not, `only` is missing. |
| `protect` | Are the state directories (login, configuration, databases) listed explicitly, and is `protect` not papering over a glob that is too broad? |
| filters | Exactly one age filter per rule? Does the version comparison use the version detected in the same run rather than a cached one? |
| byte accounting | Does it count exactly what will be removed, excluding protected and filtered entries, and is the preview total a floor rather than an exaggeration? |
| per-entry result | Can a locked or vanished entry fail alone without stopping the rule, and does a partial run report what actually happened? |

## Test evidence for a destructive change

- A fixture built in a temp directory — never the real target, never a real `%LOCALAPPDATA%\Upkeep`.
- Cases that must exist: the plain removal set, the guard skipping the whole rule, `protect` surviving, a locked entry failing alone, and the current version surviving a stale-version rule.
- The first real execution follows a preview that was compared against an independent measurement ([procedure](../../../docs/cookbook/adding-a-cleanup-rule.md)).
- The freed total comes from the deletion results, not from the plan; a plan total reported as freed bytes is a false claim.

## Verdict

Report one of:

- **Safe to execute** — the four questions have answers, the fixture cases exist, and the preview was compared against a measurement.
- **Safe as dry run only** — the rule matches the right set but one guard, filter, or failure-reporting path is missing; name each one.
- **Stop** — the glob can escape its target, a state directory is reachable, or the only evidence is a successful run on this machine. Say which, and what would have to change.
