# AGENTS.md — The documentation standard

This file defines where each fact lives, the writing rules, and the `pnpm run doc-budgets` ceilings. Use [upkeeper-doc](../.agents/skills/upkeeper-doc/SKILL.md) to place and audit a document.

## The tier taxonomy: one home per fact

Every fact has one home — the tier whose job it is. Elsewhere, link there.

| Tier | Job | Does NOT belong there |
|---|---|---|
| Root [AGENTS.md](../AGENTS.md) | Standing orders an agent needs in every session: one to three lines each, linking the owning document, plus the single repository status line; written in Chinese | Worked examples, step-by-step procedures, anything restated from a linked home |
| Root [README.md](../README.md) / [README.en.md](../README.en.md) | The product front page for a reader who has just arrived: what it is, who it is for, the forms it manages, milestones, prerequisites, quick start, FAQ, and the documentation map. It may summarize what `docs/` owns, because onboarding needs one screen | Contracts (link them), anything untrue today, screenshots or downloads that do not exist, a summary that disagrees with its home |
| [architecture.md](architecture.md) | The ordered map of the shipped source: layering, the pipeline stages, module ownership, the IPC surface | Per-provider detail (→ [providers.md](providers.md)), field-by-field config (→ [config-schema.md](config-schema.md)), rationale (→ Agent Notes) |
| [environment.md](environment.md) | Measured machine facts with their probes and the re-measure procedure | Design intent, provider contracts, cleanup policy |
| [execution-safety.md](execution-safety.md) | Spawning, proxy, elevation, timeout, cancellation, and teardown rules for child processes | Cleanup policy (→ [cleanup-rules.md](cleanup-rules.md)), per-app command lines (→ `config/apps.yaml`) |
| [cleanup-rules.md](cleanup-rules.md) | Matching semantics, the three hard rules, and the review checklist for a new rule | The `Rule` field reference (→ [config-schema.md](config-schema.md)) |
| [config-schema.md](config-schema.md) | Field-by-field reference for `apps.yaml`: every key, allowed value, default, and interaction | Rationale for a chosen default (→ Agent Note), measured sizes (→ environment.md) |
| [providers.md](providers.md) | The `Provider` trait contract, the five mechanisms, the manager table, the `declarative` fallback, `latest` source chains | Implementation narration of one mechanism (→ its source file header) |
| [ui.md](ui.md) | Panels, states and badges, which event drives which panel, interaction rules | Component implementation and styling (→ `src/`), colour and type (→ [style-direction.md](style-direction.md)) |
| [style-direction.md](style-direction.md) | The aesthetic direction: the evidence from each reference, the constraints adopted, the rejected options, and the questions blocking a freeze. Chinese, because its reviewer is the author | Panel behaviour (→ [ui.md](ui.md)), token values (→ the visual identity file, written in the [design.md](https://github.com/google-labs-code/design.md) format), component specs |
| [development.md](development.md) | Toolchain prerequisites, proxy and mirror setup, daily workflow, the command surface | Milestone acceptance evidence (→ [testing.md](testing.md)), standing rules (→ AGENTS.md) |
| [testing.md](testing.md) | Required evidence per milestone, test layout and lanes | One-off manual procedures (→ the owning cookbook) |
| [cookbook/](cookbook/README.md) | Step-by-step how-tos with numbered verify steps | Design rationale (→ the Agent Note each guide links) |
| [postmortem/](postmortem/README.md) | Incident stories — the only tier where failure narrative belongs | Current rules (they live in execution-safety/cleanup-rules and link back here) |
| [Agent Notes](../.agents/notes/README.md) | The why, what was given up, consequences, and required verification; `implemented/` describes shipped reality | Procedures, field references, status annotations, milestone checklists |
| Subtree `AGENTS.md` (`src/`, `src-tauri/`) | Orders specific to that subtree | Repo-wide rules the root file already carries |
| Subtree `README.md` | The ownership map for that directory: what each child owns and what it must not | Restated repo rules, copied field tables |
| Skills (`.agents/skills/`) | Reusable workflows and decision standards an agent loads on demand | Product contracts and field references (→ `docs/`) |
| [DESIGN.md](../DESIGN.md) | The design document while it is a draft: revised in place with a version bump and a 变更记录 row, together with the measurements behind it | Once the design is approved and M0 starts, it freezes at that version; later changes go to `docs/` and an Agent Note, and its body is left alone. Current behaviour never lives here |

Placement: incident evidence → postmortems; rationale → Agent Notes; procedures → cookbooks; contracts → `docs/`; standing orders → root `AGENTS.md`; per-directory ownership → subtree READMEs; a design change → DESIGN.md while it is still a draft, and an Agent Note once it has frozen.

## Writing rules

- **Document current state.** Keep history in git, Agent Notes, or a postmortem; prose names live mechanisms, not changes or "not yet implemented" status.
- **One physical line per paragraph**; use editor soft-wrap. Code blocks, tables, and list structure keep their formatting.
- **Use relative Markdown links** for repo files and name issues or releases by number for anything outside the repo. A link must resolve at the time of the change.
- **Do not restate a catalog that source owns.** Provider lists come from `src-tauri/src/providers/`, rule inventory from `config/apps.yaml`, command names from `src/ipc/`. The root README pair is the one tier allowed to summarize for onboarding, and only with a link to each fact's home.
- **A front page describes what exists.** Capability that is planned but absent is named as a milestone, never advertised as available; a screenshot of an interface that has not been built is not a screenshot.
- **No status annotations in prose or diagrams.** The only exceptions are the status line in root `AGENTS.md` and the one in the README pair, which exist because a project that has not shipped must say so; [DESIGN.md#8](../DESIGN.md#8-里程碑与验收标准) owns milestone acceptance, and no other document writes "not built yet" — the absence of a file says it.
- **Root `AGENTS.md`, `README.md`, and `docs/style-direction.md` are Chinese; every other document is English.** The front page carries a paired English counterpart, `README.en.md`; the two keep the same sections in the same order and change together. The aesthetic direction is Chinese because the person who reviews it is the repository's author, and reviewing tone and taste in a second language is where that review fails. Paths, commands, field names, and identifiers stay verbatim in either language and are never translated. Agent Notes stay English even when they record a Chinese-source decision.
- **State complete contracts, not reasoning transcripts.** Keep behaviour, failure, timing, ownership, limits, and safety facts; delete step narration, test walkthroughs, and code restatement.
- **A code-adjacent doc updates in the same change as the code.** A field table that no longer matches `apps.yaml`, or a trait signature that no longer matches `providers.rs`, is a defect of the change that moved the code.
- **Every non-trivial change adds or updates an [Agent Note](../.agents/notes/README.md)** in the same change.
- Write directly: name the actor, the file, the field, and the measured number. Reserve emphasis for the clause that changes behaviour.

## Word budgets

The gate counts word-equivalents, not bytes: western text by whitespace, each CJK character as 0.6 of a word (1.7 characters ≈ one English word, approximating their relative tokenizer cost). The script `scripts/doc-budgets.mjs` and the `doc-budgets` command arrive in M0; until then the ceilings are reviewed by hand.

| Document | Ceiling |
|---|---|
| Root `AGENTS.md` | 1,650 |
| `docs/AGENTS.md` (this file) | 1,600 |
| `docs/architecture.md` | 1,800 |
| `docs/environment.md` | 1,500 |
| `docs/execution-safety.md` | 1,150 |
| `docs/cleanup-rules.md` | 1,000 |
| `docs/config-schema.md` | 1,800 |
| `docs/providers.md` | 1,700 |
| `docs/ui.md` | 950 |
| `docs/style-direction.md` | 2,800 |
| `docs/development.md` | 1,000 |
| `docs/testing.md` | 950 |
| Root `README.md` / `README.en.md` (front-page pair) | 2,200 each |
| Subtree `AGENTS.md` | 550 |
| Subtree `README.md` | 300 |
| `.agents/notes/README.md` | 900 |
| Skill | 700 |
| `upkeeper-handoff` skill | 750 |

`upkeeper-handoff` carries two jobs (taking over, unattended work), hence its higher ceiling; another skill needing more room is doing two jobs and should be split.

A field reference carries a larger ceiling than prose because table cells convey less per word.

When the gate goes red:

1. **Relocate** content that belongs in another tier and leave a one-line link.
2. **Condense** content that belongs here but reads long.
3. **Raise** the ceiling only when the content genuinely needs the space; justify the diff. A ceiling that is too low is a budget bug.

Ceilings are guardrails, not targets. Keep ≥5% headroom under a satisfied ceiling; freeze an exceeded one until relocation or condensation brings it back under.

## The slop checklist

Hunt these in any document; [upkeeper-doc](../.agents/skills/upkeeper-doc/SKILL.md) runs this list as an audit.

- Duplicated rules: search a distinctive phrase, keep one home, link the rest.
- History outside its permitted tier: state the current fact and link the owner.
- Status annotations ("implemented", "future", "not yet built") outside the two permitted status lines.
- Hand-restated catalogs, field tables, or inventories that source and `config/apps.yaml` already own.
- Reasoning transcripts: implementation narration, test walkthroughs, or rejected local alternatives.
- Rationale repeated beside sibling items instead of once at the owning decision.
- Paragraph walls carrying several rules at once.
- Emphasis inflation: bold everywhere means nothing stands out.
- Spec-speak in an `implemented/` Agent Note: "should", migration plans, acceptance checklists.
