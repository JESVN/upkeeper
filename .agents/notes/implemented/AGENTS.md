# AGENTS.md — Implemented Agent Notes

These notes describe shipped decisions: `## Problem`, `## Decision`, `## Alternatives considered`, `## Consequences`, `## Verification`.

- **Keep facts current.** Paths, module names, field defaults, stage names, and commands are updated in the same change that moves them. Rewrite the stale sentence; do not append change history.
- **This is not a licence to rewrite the decision.** A reversal needs a new note and a cross-link, not an edit that makes the old note say the opposite.
- **Name the verification.** The command or observation in `## Verification` must be one that exists; if the decision removed the need for a test, say what is checked instead.
- A note whose rationale no longer guides future work is archived through [the archiving rule](../README.md#archiving), not deleted.
