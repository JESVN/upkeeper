---
name: upkeeper-doc
description: Create, move, review, or audit Upkeep documentation — root and subtree AGENTS.md, docs/ pages, subtree READMEs, cookbook guides, postmortems, and Agent Notes. Use when adding or restructuring an Upkeep document, when a fact seems to live in two places, when a document exceeds its ceiling, or when asked to check whether Upkeep's docs match the code.
---

# Upkeep documentation

Place and audit Upkeep documents using the tier taxonomy in [docs/AGENTS.md](../../../docs/AGENTS.md), which owns the rules; this skill is the procedure.

## Place a new fact

1. Name the fact in one sentence, with its actor and its subject.
2. Ask which tier's job it is: standing order → root [AGENTS.md](../../../AGENTS.md); shipped structure or a stage contract → [architecture.md](../../../docs/architecture.md); a measured machine number → [environment.md](../../../docs/environment.md); a spawning, proxy, elevation, timeout, or teardown rule → [execution-safety.md](../../../docs/execution-safety.md); deletion policy → [cleanup-rules.md](../../../docs/cleanup-rules.md); a key, type, allowed value, or default → [config-schema.md](../../../docs/config-schema.md); a per-form contract → [providers.md](../../../docs/providers.md); a panel, badge, or interaction rule → [ui.md](../../../docs/ui.md); setup or a command → [development.md](../../../docs/development.md); required evidence → [testing.md](../../../docs/testing.md); a step-by-step procedure → [cookbook/](../../../docs/cookbook/README.md); an incident narrative → [postmortem/](../../../docs/postmortem/README.md); the why and what was given up → an [Agent Note](../../notes/README.md).
3. Search the distinctive phrase across the repo before writing. If it already lives somewhere, update that home instead of adding a second copy.
4. Write it in the owning document, and replace whatever the old location said with a relative link.

Root `AGENTS.md` admits a fact only if an agent needs it in every session; a situational procedure belongs in a cookbook or a skill.

## Audit a document

Run the [slop checklist](../../../docs/AGENTS.md#the-slop-checklist) explicitly, in this order:

1. **Duplication** — grep two or three distinctive phrases from the document; a hit in another file means one of the two must become a link.
2. **History in the wrong tier** — a sentence about what changed, or about what is not built yet, is removed regardless of how informative it is.
3. **Restated catalogs** — a provider list, rule inventory, or command table that source files or `config/apps.yaml` already declare is deleted, not corrected.
4. **Reasoning transcripts** — step narration, test walkthroughs, and rejected local alternatives go to an Agent Note or nowhere.
5. **Paragraph walls and emphasis inflation** — split them; keep bold for the clause that changes behaviour.
6. **Links** — resolve every relative link and anchor in the changed files by hand until M0 installs a checker.

## Check the budget

Count words treating a CJK character as one word, then compare to the ceiling in [docs/AGENTS.md](../../../docs/AGENTS.md#word-budgets). When a document is over: relocate first, condense second, raise the ceiling last and only with a reason in the change. When a document is under, leave the ceiling alone — it is a guardrail, not a target.

## Move a document

1. Move the file, then repair every inbound link with a repo-wide search for the old path and for any anchor into it.
2. Update the layout tree in root [AGENTS.md](../../../AGENTS.md), the tier table in [docs/AGENTS.md](../../../docs/AGENTS.md), and any tier index (`cookbook/README.md`, `postmortem/README.md`, `docs/AGENTS.md`).
3. Never move [DESIGN.md](../../../DESIGN.md) or rewrite it: it is the frozen v0.1 record, and the new home of a changed fact is `docs/`.
