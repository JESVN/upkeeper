# Postmortems

An incident story: what broke, what it cost, and which rule the fix produced. This is the only tier where narrative belongs — the rules themselves live in [execution-safety.md](../execution-safety.md) and [cleanup-rules.md](../cleanup-rules.md) and link back here for their evidence.

| File | Incident |
|---|---|
| [0001-omp-update-timeout-and-proxy.md](0001-omp-update-timeout-and-proxy.md) | `omp update` burned its 15-minute limit on a direct connection because Bun fetch ignores the system proxy |

Write one when a failure taught something that a future change could undo: a hidden limit, a tool that lies about success, a data-loss near miss, a destructive operation that behaved differently than its preview. Do not write one for a bug fixed in the same session whose fix is already obvious from the test.

Format — `NNNN-<slug>.md`, sections in this order:

1. **Impact** — what was lost, wasted, or nearly lost, with numbers.
2. **What happened** — the sequence as observed, including the misleading signals.
3. **Root cause** — the mechanism, not the symptom.
4. **Fix** — what changed.
5. **Rules** — the links to the rules this incident produced, so the rule and its evidence stay connected.

Record what was measured and what was assumed; a postmortem that guesses at its own root cause is worse than none. Numbers stay in [environment.md](../environment.md) when they also describe the machine's current state.
