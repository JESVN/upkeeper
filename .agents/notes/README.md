# Agent Notes

An **Agent Note** records a decision that affects this codebase: the *why*, what was given up, what it costs, and how the decision is verified. It is the tier for the parts code and reference docs cannot carry. This file defines where notes live, when to write one, and the in-file format.

## Layout and naming

A note's path encodes two axes: `{lifecycle}/{class}/YYYY-MM-DD-topic-title.md`. The date is when the topic was first proposed.

- **`proposed/`** — reviewed before implementation, not built yet. A note stays here until the decision ships.
- **`implemented/`** — the decision shipped. The note describes what is, kept current with paths, names, and defaults but never rewritten into a different decision ([rules](implemented/AGENTS.md)).
- **`rejected/`** — considered and declined. Keep it only while its rationale prevents a plausible mistake; otherwise delete it.
- **`archived/`** — frozen history for an implemented note that is unlikely to guide future work. Never edit, move, or cite as current authority ([rules](archived/AGENTS.md)).

Cross-references between notes use relative Markdown links, never bare prose, so they survive a move between folders. There is no index file; the tree is the inventory.

## Classification

| Class | Covers |
|---|---|
| `feature` | A new user-facing capability |
| `bug-fix` | A defect fix or a gap a postmortem surfaced |
| `simplification` | Removes code, behaviour, or surface without adding a capability |
| `architecture` | How modules, stages, or contracts are structured |
| `process` | Tooling, gates, packaging, workflow around the code |
| `testing` | Test infrastructure and strategy |

`architecture` is about the code we ship; `process` is about the tooling and workflow around it.

## When to write one

Every non-trivial change adds or updates at least one note in the same change. A change is non-trivial when it alters behaviour, a contract shared across files, a config or on-disk format, the pipeline's stages, safety rules, testing strategy, or packaging. Updating the note that already owns the decision satisfies the rule; do not create a duplicate.

Only a purely mechanical or local edit is exempt — a rename, a comment, a copy fix, a rule reordering with no semantic change. When in doubt, write the note: a short note is cheap, and a decision that exists only in a commit message is not.

A note is never edited into a different decision. Supersede it with a new note and cross-link both; a fully superseded implemented note may be deleted only if its unique rationale, alternatives, and consequences are preserved in the successor and every inbound link is repaired.

## The file format

Until M0 adds `.agents/notes` validation to the doc gate, the format below is enforced by review. Every note is a single file — this project keeps no bilingual pairs, and the bilingual gloss convention in [AGENTS.md](../../AGENTS.md) applies to standing orders only.

### Header

```markdown
# Agent Note: <title>

Status: <status>
```

The `Status:` value agrees with the folder and is one of `Status: proposed`, `Status: implemented`, or `Status: rejected — <one-line reason>`. No dates in the status; the filename carries the proposal date and git carries the rest.

### `proposed/` body

| Section | Content |
|---|---|
| `## Problem` | The motivation, written to stand without the solution |
| `## Proposal` | What is being built, and the contracts it introduces |
| … | Bespoke technical sections where they are needed (schemas, topology, wire format) |
| `## Alternatives considered` | Each option with the specific reason it lost |
| `## Acceptance criteria` | What will be observed to call it done, phrased so it can be checked |
| `## Risks` | What could make it fail or need revisiting, with the mitigation |

### `implemented/` body

| Section | Content |
|---|---|
| `## Problem` | The motivation as it stood when decided |
| `## Decision` | What is, in the present tense, with the mechanism named |
| `## Alternatives considered` | The options that lost, and why |
| `## Consequences` | What it costs, what it forbids, and what it made possible |
| `## Verification` | The test, command, or observation that proves the decision is in force |

An implemented note describes shipped reality: no "should", no migration steps, no acceptance checklists.

## Archiving

Archive an implemented note when the decision is complete and its alternatives are unlikely to guide future work. Keep it active while its ownership boundary, negative guarantee, safety rule, or reintroduction condition still matters. Never archive a proposed note — reject it instead.

An archival move preserves the file's content and adds `Archived: YYYY-MM-DD` directly below the status. From then on the file is frozen.
