# AGENTS.md — Proposed Agent Notes

A proposed note is a reviewed plan: `## Problem`, `## Proposal`, `## Alternatives considered`, `## Acceptance criteria`, `## Risks`.

- Keep the acceptance criteria checkable. "omp and pi upgrade in one run" is checkable; "updates work reliably" is not.
- Link the [milestone](../README.md) or cookbook that will carry the work rather than restating its steps.
- When the work ships, move the file to `implemented/` in the same change, rewrite it as what is (not what was planned), and update its status line. A proposal that ships unchanged except for tense is a sign the proposal was already written as a decision — that is fine, the move is still required.
- When the work is declined, move it to `rejected/` with the one-line reason in the status, or delete it if the rationale teaches nothing.
