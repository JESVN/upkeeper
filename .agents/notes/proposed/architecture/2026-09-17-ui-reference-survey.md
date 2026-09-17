# Agent Note: The UI reference survey behind the ink-and-paper direction

Status: proposed

## Problem

The direction recorded in [the aesthetic-direction note](2026-09-17-ui-aesthetic-direction.md) is a conclusion drawn from seven references, each inspected at a pinned commit. That reasoning has nowhere to live otherwise: the cloned repositories were deleted after analysis (`_recon/` is gitignored and holds only a 164 KB quote set), and a conclusion without its evidence cannot be re-litigated when someone later asks why a reference was accepted or refused. [docs/style-direction.md](../../../../docs/style-direction.md) states the constraints a implementer must follow; it is the wrong place for a per-reference survey, because a standing constraint document does not need 3,000 words of upstream evidence to be applied.

So the survey is kept here: what each reference observably is, what it is worth, and what it was rejected for. Every claim below was read from the pinned commit listed in [`_recon/REFS.md`](../../../../_recon/REFS.md) — README text, token files, component configuration, screenshots, licence files, and directory structure — not from reputation or star count.

## Reference-by-reference evaluation

Each reference is assessed on sixteen dimensions: visual keywords, colour system, typography, spacing/radius/shadow, component style, layout, iconography and illustration, motion and interaction, dark mode and responsiveness, accessibility, stack reusability, licence, maintenance activity, documentation and examples, matches with this project, and conflicts with it. The verdict follows the matches and conflicts.

### 1. muzimu217/ui-design-agent-kit

Observable evidence: a Chinese README describing "a project-level AI design workflow from spoken requirements to a verifiable interface"; the repository contains `docs/` (14 files), `evals/`, `showcase/`, `tooling/sources.lock.json`, and an `npm run verify` gate; `showcase/DESIGN.md` records ink `#111313`, paper `#f2f0e9`, lime `#d4ff3f`, coral `#ff795d`, blue `#74a9ff`, amber `#ffbf69` with Syne / Manrope / DM Mono; `showcase/products/screenshots/readme-desktop.webp` is a real desktop screenshot — warm-white ground, very heavy black display heading, hairline-bordered card grid, green primary button.

| Dimension | Finding |
|---|---|
| Visual keywords | Editorial showroom (paper ground, heavy black headings, hairline cards); **the repository is not a style library** |
| Colour system | Documented tokens, but lime/coral are neon |
| Typography | Syne / Manrope / DM Mono — all webfonts, conflicting with CJK plus offline |
| Spacing / radius / shadow | Even card grid, medium radius, almost no shadow (screenshot) |
| Components | Buttons, cards, media blocks; marketing-page oriented |
| Layout | Sticky black topbar, split hero, dense panel grid |
| Iconography | Line icons plus text labels; includes an mp4/Remotion video pipeline |
| Motion | Explicit tiers Snappy / Playful / Elegant, and reduced-motion removes spatial movement and looping previews |
| Dark mode, responsive | Paired dark cards in the screenshots; claims both desktop and narrow widths stay legible |
| Accessibility | Claims visible focus and contrast; gallery screenshots offered as evidence |
| Stack reusability | React/Vite/Tailwind, but positioned as an agent workflow rather than a component source |
| Licence | **No SPDX licence**, README states it is maintained as an internal tool |
| Activity | 19 stars, pushed 2026-09-17 — very new, small sample |
| Documentation | High (README + 14 docs + AGENTS.md) |
| Matches | Chinese-language workflow; "verify before delivering"; screenshots as numeric evidence |
| Conflicts | Neon accents; webfonts; no licence means no code, assets, or fonts may be reused |
| Adaptation cost | Low (concepts and layout temperament only) |

**Verdict: partial reference only** — its workflow and its "screenshot as evidence" habit are worth keeping; nothing from it may be used as a colour, font, or code source.

### 2. JCodesMore/ai-website-cloner-template

Observable evidence: README in three languages; `components.json` is a shadcn/ui config (`style: base-nova`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`); `docs/research/INSPECTION_GUIDE.md` is the reference-site inspection procedure, while `docs/design-references/` currently holds a single comparison image; the frontend is 3 tsx files — the bulk is a Next.js App Router + RSC skeleton with per-agent instruction files (AGENTS.md / CLAUDE.md / GEMINI.md).

| Dimension | Finding |
|---|---|
| Visual keywords | No style of its own — the style is whatever site is cloned |
| Colour system | Tailwind `baseColor: neutral` plus CSS variables, overwritten by the cloned site |
| Typography | Unspecified |
| Spacing / radius / shadow | shadcn defaults via a `--radius` variable |
| Components | shadcn/ui over Radix primitives; lucide icons |
| Layout | Next.js RSC page skeleton, not a desktop layout |
| Iconography | lucide (line icons, tree-shakeable) |
| Motion | None built in |
| Dark mode, responsive | CSS variables plus a class strategy (shadcn convention) |
| Accessibility | Radix primitives carry keyboard and ARIA behaviour |
| Stack reusability | **Next.js/RSC is not isomorphic with a Tauri frontend**; the shadcn component layer and lucide are portable |
| Licence | MIT |
| Activity | 34,550 stars, pushed 2026-09-17 |
| Documentation | README in three languages, docs, three agent instruction files |
| Matches | ① the "reference site → extract → rebuild" method; ② shadcn/ui + lucide as a low-risk component and icon baseline; ③ treating design references as managed input |
| Conflicts | Cloning another site's appearance and assets is a copyright risk; RSC does not apply; it solves replication, not choosing a direction |
| Adaptation cost | Low (method plus component and icon baseline) |

**Verdict: method and toolchain reference** — not a style source.

### 3. google-labs-code/design.md

Observable evidence: README describes "a format specification for describing a visual identity to coding agents"; `docs/spec.md` defines the YAML front-matter token groups `colors`, `typography` (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeature, fontVariation), `rounded`, `spacing`, and `components` (with `{colors.primary}`-style token references); prose sections have a fixed order — Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts; the CLI `npx @google/design.md lint` emits structured JSON including **WCAG contrast** checks, and `diff` does token and prose regression; three examples ship (atmospheric-glass, paws-and-paths, totality-festival), the Heritage sample reading "Architectural Minimalism meets Journalistic Gravitas … warm limestone, softer than pure white".

| Dimension | Finding |
|---|---|
| Visual keywords | A format, not a style; the samples span dark-gold festival, glass, and minimal editorial |
| Colour system | Tokenised, including `on-*` / `*-container` semantic pairing (totality-festival is a Material-style set) |
| Typography | Tokens cover family, size, weight, line height, letter spacing, features, variation axes |
| Spacing / radius / shadow | `spacing`, `rounded`; Elevation & Depth is its own prose section |
| Components | `components.*` tokens may reference other tokens |
| Layout | Described by the file; the spec imposes nothing |
| Iconography | Not covered |
| Motion | Not covered (permitted under Do's and Don'ts) |
| Dark mode, responsive | No convention imposed; expressed through colour token naming |
| Accessibility | **Built-in WCAG contrast gate** |
| Stack reusability | A Node CLI, which fits this repository's `pnpm run` gates |
| Licence | Apache-2.0 |
| Activity | 27,971 stars, pushed 2026-09-14 |
| Documentation | Spec, three complete samples, CONTRIBUTING, PHILOSOPHY |
| Matches | Gives the visual identity a lintable, diffable, gated home; the contrast check is exactly "state colours must be readable" |
| Conflicts | **Filename collision**: the format file is called `DESIGN.md`, and this repository's `DESIGN.md` is the product design record |
| Adaptation cost | Low (one file plus one `pnpm run` command) |

**Verdict: adopt the format** (tokens plus rationale plus Do's/Don'ts), written as `docs/visual-identity.md` to avoid the collision; **not a visual style source**.

### 4. kepano/flexoki

Observable evidence: README describes "an inky color scheme for prose and code … inspired by analog printing inks and warm shades of paper"; `css/flexoki.css` carries the full token set — `--flexoki-black #100F0F`, `--flexoki-paper #FFFCF0`, a warm neutral ramp 50→950 (`#F2F0E5` → `#1C1B1A`), and nine families (red, orange, yellow, green, cyan, blue, purple, magenta, neutral) at twelve steps each; the README ports list includes Windows Terminal, VS Code, Obsidian, GTK, Discord, and Slack among 40+; MIT.

| Dimension | Finding |
|---|---|
| Visual keywords | Inky, warm paper, printing inks, designed for long reading and writing |
| Colour system | **Its strongest asset**: 15 neutral steps plus 8 families × 12 steps, light and dark designed as a pair |
| Typography | Decoupled from fonts (ships none) — ours to choose |
| Spacing / radius / shadow | Not covered — ours to choose |
| Components | None (pure tokens) — ours to build |
| Layout | Not covered |
| Iconography | Not covered |
| Motion | Not covered |
| Dark mode, responsive | Light and dark designed from the same ramps, which is why so many tools port it |
| Accessibility | Fine steps (50/100/150/…) make AA/AAA selection practical, but it ships no contrast gate — supplied by the design.md linter |
| Stack reusability | Plain CSS variables, mapping directly onto Tailwind v4 `@theme` |
| Licence | MIT |
| Activity | 3,665 stars, last pushed 2026-03 — colours do not change often; mature rather than stalled |
| Documentation | Concise README; `_images/` has light, dark, palette, and syntax-highlighting screenshots; 40+ real ports are the strongest applicability evidence |
| Matches | Same ink-and-paper motif; families map 1:1 onto the six badges in [docs/ui.md](../../../../docs/ui.md#row-states); paired light/dark; MIT; existing Windows Terminal and VS Code ports show it holds up in tool-class dark interfaces |
| Conflicts | No fonts, spacing, or components; warm white must be tested under night mode, HDR, and 125%/150% scaling; a warm ground next to unthemed native grey panels reads dirty |
| Adaptation cost | Low (copy variables into `@theme`) |

**Verdict: core adoption** as the colour base; fonts, spacing, and components must still be decided here.

### 5. Leonxlnx/taste-skill

Observable evidence: 13 skills under `skills/` (taste-skill, minimalist, brutalist, soft, redesign, image-to-code, brandkit, output, gpt-taste …); SKILL.md defines **two visual archetypes**: `Swiss Industrial Print` (high-contrast light grounds, monolithic heavy sans-serif, structural dividing lines, aggressive asymmetric negative space, viewport-bleeding numerals, primary red as the accent) and `Tactical Telemetry & CRT Terminal` (dark only, dense tabular data, monospace dominance, ASCII brackets and crosshairs, phosphor glow and scanlines); a hard rule reads "**Pick ONE per project and commit to it. Do not alternate or mix both modes within the same interface.**"; `# ANTI-GENERIC RULES` forbids random floating icons, generic startup gradients, meaningless blobs, collage layouts, fake tiny UI, cheap neon, stock-template brand boards, and **soulless SaaS dashboards**, closing with "Make the design quieter, sharper, and more intentional."; three dials are exposed — `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`; the `floria-*.webp` examples are dark editorial marketing pages (near-black ground, oversized white type, italic serif accents, numbered process, large-radius image cards).

| Dimension | Finding |
|---|---|
| Visual keywords | Anti-slop, restrained, structural; two named archetypes |
| Colour system | Archetype-level constraints (high-contrast light plus a single red; or dark only plus signal colours), not a token table |
| Typography | Macro-typography for structural headers, micro-typography for data and telemetry |
| Spacing / radius / shadow | Visible structural lines and asymmetric negative space; no numeric scale |
| Components | No components — criteria instead |
| Layout | Grid plus bleeding elements plus numbered sequences |
| Iconography | Explicitly opposed to random icons and decorative illustration |
| Motion | A `MOTION_INTENSITY` dial; the examples lean on scroll and magnetic effects |
| Dark mode, responsive | One archetype dark, one light; the rule requires choosing one |
| Accessibility | Not a focus (contrast is out of scope for it) |
| Stack reusability | Prompts and rules only, no reusable code |
| Licence | MIT |
| Activity | 87,931 stars, pushed 2026-09-16 — the most active reference |
| Documentation | README, 13 SKILL.md files, `research/`, `examples/` |
| Matches | ① the archetypes address a console/table interface directly; ② the anti-slop list is usable verbatim as a "do not" checklist; ③ the three dials become project constraints (low motion, high density, low experimentation) |
| Conflicts | CRT staging (scanlines, phosphor) fatigues and reads cheap over daily use; the no-mixing rule needs the boundary between "density region" and "second skin" stated explicitly; the examples are marketing pages, not consoles |
| Adaptation cost | Low (rules and archetype direction, no code) |

**Verdict: source of constraints and criteria** — take the Swiss Industrial Print structural rules and the anti-slop list; take only "monospace plus density" from the CRT archetype, never its staging.

### 6. alchaincyf/huashu-design

Observable evidence: a Chinese SKILL.md covering high-fidelity HTML prototypes, slides, animation, and expert review, with a hard requirement that **every new design first produces three direction drafts for the user to choose from, with no exception for a specified style or brand**; a role system (art director, brand researcher, visual designer, motion designer, frontend engineer, copywriter); the stated rule that the dominant role changes with the medium — slides must not look like web pages, animation must not look like a dashboard, an app prototype must not look like a manual; 33 reference documents under `references/` (including `design-styles.md`, `critique-guide.md`, `brand-asset-protocol.md`, `animation-pitfalls.md`); `demos/` holds iOS prototypes, PPT, motion, infographics, and review pages; the stated scope excludes **production-grade web apps and anything needing a backend**.

| Dimension | Finding |
|---|---|
| Visual keywords | No fixed style — a process that decides a direction per job |
| Colour system | No fixed system; decided per case |
| Typography | No fixed system |
| Spacing / radius / shadow | No fixed system |
| Components | No component library (outputs are whole HTML artefacts) |
| Layout | Per case (prototype, slides, animation, infographic) |
| Iconography | A brand-asset protocol requiring real assets rather than imagined ones |
| Motion | Dedicated references for timing and easing — a strength |
| Dark mode, responsive | No convention |
| Accessibility | Not a focus |
| Stack reusability | Standalone HTML (with GSAP recipes) that does not fold into a React component tree |
| Licence | MIT |
| Activity | 24,235 stars, pushed 2026-09-15 |
| Documentation | SKILL.md plus 33 references plus a dozen demos |
| Matches | ① "three directions before executing" mirrors how this very survey was commissioned; ② Chinese-language critique criteria; ③ "assets must be real" matches this repository's rule that unverified values never enter the registry |
| Conflicts | Outputs are demo artefacts; applying "three directions every time" to a desktop tool would make its style oscillate; production applications are explicitly out of its scope |
| Adaptation cost | Low (process and review criteria only) |

**Verdict: process reference** — not a style source.

### 7. visualstyles.jerrymakes.com/styles/rinpa/

Observable evidence (a site, not a repository; no matching GitHub repository was found): `lang="zh-CN"`, title "琳派｜视觉风格图鉴", meta description listing gold-and-silver, botanical pattern, flatness, ornate decoration, and continuous composition; og:image `/apple-styles-photo-v2/apple-029-rinpa.png` (1254×1254 — gold-leaf ground, a red apple carrying gold-pigment flora and flowing-water lines, wood-grain table); the site is an atlas claiming "100+ visual styles", navigated by home / compare / guess, with an EN switch; static HTML plus a 32 KB stylesheet; the footer lists many style entries (ancient Egyptian, ancient Greek, Gothic, Baroque, Rococo …).

| Dimension | Finding |
|---|---|
| Visual keywords | Gold and silver, botanical pattern, flatness, ornate decoration, continuous composition |
| Colour system | Warm-dominant: gold leaf, vermilion, dark green, wood brown, rice paper |
| Typography | Decorative, not informational — no typographic reference here |
| Spacing / radius / shadow | No concept of shadow — the style is flat |
| Components | None |
| Layout | Continuous/repeating composition, translatable to repeating hairline dividers and numbered sequences |
| Iconography | Figurative botanical and water patterns (**assets may not be copied**) |
| Motion | None |
| Dark mode, responsive | None |
| Accessibility | Not applicable |
| Stack reusability | An atlas site with no reusable code |
| Licence | Unstated; site content cannot be assumed reusable |
| Activity | Unknown (the page resolves; no repository to check) |
| Documentation | One page, one image, one keyword line per style — sufficient as a vocabulary |
| Matches | ① the same paper-and-ink motif as flexoki; ② "flatness" is exactly the no-gradient, flat-plane treatment this project wants; ③ "gold and silver" degrades into warmth confined to the neutral ramp; ④ "continuous composition" degrades into repeating hairline dividers |
| Conflicts | Ornate decoration contradicts a quiet tool; gold-leaf texture becomes noise at 100%; figurative pattern ages badly |
| Adaptation cost | Medium — the artistic language has to be translated into restrained UI terms, and overdoing it reads cheap |

**Verdict: aesthetic vocabulary only** — flatness, temperature inside the neutral ramp, continuous composition as repeating dividers; never an interface paradigm, and no asset is copied. Its "gold" must **not** be translated into a coloured accent, since the accent belongs to the system setting.

## How the references combine

The seven references sit at different layers, so "choose exactly one" does not apply:

| Layer | Reference | Role here |
|---|---|---|
| Colour base | flexoki | The only reference adopted as a complete system |
| Format and gate | google-labs-code/design.md | Carries tokens and rationale, with a WCAG contrast gate |
| Criteria and constraints | taste-skill | Anti-slop list, archetype discipline, three dials |
| Aesthetic vocabulary | rinpa | Flatness, paper-and-ink temperature, continuous composition |
| Process | huashu-design, ui-design-agent-kit, ai-website-cloner-template | Three-draft intake, verification evidence, reference-driven implementation and component baseline |

**The only genuinely exclusive pair is the two style archetypes** in taste-skill: its own rule forbids mixing Swiss Industrial Print and CRT Telemetry in one interface. This project resolves that as **density regions inside one archetype** — the shell, lists, forms, and settings follow the Swiss structural rules, while only logs, progress detail, path lists, and raw data use the monospace high-density treatment — rather than switching between two skins.

**Combinations that conflict and are therefore forbidden:** webfont display faces (Syne/Manrope/DM Mono) mixed with CJK system text; neon lime/coral; gold-leaf texture and figurative botanical pattern; CRT scanlines and phosphor; light and dark not being equivalents; two accents in one surface; the system accent painted as a hairline on a low-contrast ground (measured as failing); marketing-style editorial composition in documentation (the author declined a separate editorial treatment for docs).

## Alternatives considered

- **Keep the per-reference survey inside `docs/style-direction.md`.** Rejected: it put 3,428 of that document's 5,959 word-equivalents into one-time evidence, leaving 2% headroom against its ceiling. A standing constraint document states what to do; the survey states why, which is this note's job.
- **Keep the survey only in `_recon/`.** Rejected outright: `_recon/` is gitignored, so the evidence would not exist in the repository at all, and the classification of six upstream projects would become unverifiable folklore.
- **Record the survey as a `docs/` subpage** (for example `docs/style-references.md`). Rejected: the tier table assigns rationale to Agent Notes, and a reference survey has no maintenance obligation once the direction is frozen — a `docs/` page implies current-state authority it should not have.
- **Summarize each reference in two lines and drop the sixteen dimensions.** Rejected: the dimensions are what make a verdict checkable, and the two-line version is how "19 stars, no licence" gets remembered as "a Chinese design workflow worth copying".

## Acceptance criteria

- Every verdict in [docs/style-direction.md](../../../../docs/style-direction.md) traces to a cited observation in this survey, and every citation names the file or token it came from.
- `docs/style-direction.md` holds decisions and constraints only, with enough headroom under its ceiling that a future change can add a constraint without first relocating evidence.
- The pinned commits and licences remain recorded in `_recon/REFS.md`, and the two facts that constrain reuse are restated in `docs/style-direction.md`: ui-design-agent-kit has no licence, and flexoki's MIT notice must travel with any copied token values.

## Risks

- **The survey rots while the repositories move.** Pinned commits are named, so a later disagreement is honest: the project was assessed at that commit, and a re-check means re-reading the new one.
- **A verdict can be quoted without its dimension.** "Partial reference" and "not a style source" read as contradictions unless the dimension that produced them is named.
- **Deleted clones are unrecoverable locally.** Anything not copied into the quote set before deletion needs a network round-trip, which is why the quote set and this note carry the load-bearing excerpts.
