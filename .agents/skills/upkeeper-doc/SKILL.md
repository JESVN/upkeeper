---
name: upkeeper-doc
description: Create, move, review, or audit Upkeep documentation — root and subtree AGENTS.md, docs/ pages, subtree READMEs, cookbook guides, postmortems, and Agent Notes. Use when adding or restructuring an Upkeep document, when a fact seems to live in two places, when a document exceeds its ceiling, or when asked to check whether Upkeep's docs match the code.
---

# Upkeep documentation

Place and audit Upkeep documents using the tier taxonomy in [docs/AGENTS.md](../../../docs/AGENTS.md), which owns the rules; this skill is the procedure.

## Place a new fact

1. Name the fact in one sentence, with its actor and its subject.
2. Ask which tier's job it is: a standing order → root [AGENTS.md](../../../AGENTS.md); a summary a newcomer needs on arrival → the [README pair](../../../README.md), which links the home rather than owning the fact; shipped structure or a stage contract → [architecture.md](../../../docs/architecture.md); a measured machine number → [environment.md](../../../docs/environment.md); a spawning, proxy, elevation, timeout, or teardown rule → [execution-safety.md](../../../docs/execution-safety.md); deletion policy → [cleanup-rules.md](../../../docs/cleanup-rules.md); a key, type, allowed value, or default → [config-schema.md](../../../docs/config-schema.md); a mechanism or manager contract → [providers.md](../../../docs/providers.md); a panel, badge, or interaction rule → [ui.md](../../../docs/ui.md); setup or a command → [development.md](../../../docs/development.md); required evidence → [testing.md](../../../docs/testing.md); a step-by-step procedure → [cookbook/](../../../docs/cookbook/README.md); an incident narrative → [postmortem/](../../../docs/postmortem/README.md); the why and what was given up → an [Agent Note](../../notes/README.md).
3. Search the distinctive phrase across the repo before writing. If it already lives somewhere, update that home instead of adding a second copy.
4. Write it in the owning document, and replace whatever the old location said with a relative link.

Root `AGENTS.md` admits a fact only if an agent needs it in every session; a situational procedure belongs in a cookbook or a skill.

## Audit a document

Run the [slop checklist](../../../docs/AGENTS.md#the-slop-checklist) — that list is the definition of what counts as slop; do not restate it here. This skill adds the mechanical steps the list cannot state:

1. **Work the checklist item by item, in its order**, and report which items you checked rather than saying "audited".
2. **Duplicate hunt** — grep two or three distinctive phrases from the document; a hit in another file means one of the two must become a link. This is the one item worth actually running, not reading.
3. **Links** — resolve every relative link and anchor in the changed files by hand until M0 installs a checker. Directory targets are valid; a link that resolves to neither a file nor a directory is broken.
4. **The front-page pair** — `README.md` and `README.en.md` must carry the same sections in the same order, and a fact changed in one is changed in the other in the same edit.

## Check the budget

Count word-equivalents the way [docs/AGENTS.md](../../../docs/AGENTS.md#word-budgets) defines the measure (western text by whitespace, CJK characters weighted per that section), then compare to its ceiling table. When a document is over: relocate first, condense second, raise the ceiling last and only with a reason in the change. When a document is under, leave the ceiling alone — it is a guardrail, not a target.

## Move a document

1. Move the file, then repair every inbound link with a repo-wide search for the old path and for any anchor into it.
2. Update the layout tree in root [AGENTS.md](../../../AGENTS.md), the tier table in [docs/AGENTS.md](../../../docs/AGENTS.md), and any tier index (`cookbook/README.md`, `postmortem/README.md`, `docs/AGENTS.md`).
3. Never move [DESIGN.md](../../../DESIGN.md) or rewrite it: it is the frozen v0.1 record, and the new home of a changed fact is `docs/`.
