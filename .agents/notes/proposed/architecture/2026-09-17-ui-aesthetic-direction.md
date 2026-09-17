# Agent Note: The UI aesthetic direction is ink-and-paper neutrals with the system accent colour

Status: proposed

## Problem

The repository fixes the UI's *behaviour* — panels, badges, states, interaction rules in [docs/ui.md](../../../../docs/ui.md) — and its stack, but not its *look*. Without a stated direction, the first implementation round would decide the aesthetic by accident: Tailwind defaults plus a borrowed palette, which is how a tool ends up looking like the generic dashboard that agent-generated interfaces converge on.

The constraint that makes this non-obvious is Chinese copy plus a local-only application. The polished reference material available for web UIs is built on bundled webfonts (display serif, grotesk, mono families) and on marketing-page compositions a single-window console cannot use. Bundling a CJK webfont costs 5–20 MB and contradicts a tool whose premise is that it neither phones home nor ships ballast. So the direction has to be reachable with **system fonts, flat surfaces, and one accent colour**, decided before any component exists, because retrofitting consistency onto a built interface costs more than this whole round.

A second problem surfaced while answering the open questions: two requirements the author then confirmed — follow the system light/dark mode, and honour the Windows accent colour — pull against the direction as first drafted. The accent colour is not a design choice but a system setting that can be any hue, and measurement showed the default (`#0078D4`) falling below AA when used as text or a hairline on either intended ground (3.80:1 on dark, 4.41:1 on paper). A direction that says "one warm accent" cannot coexist with that.

A third, narrower problem: the project needs a home for a visual identity that both a human and an agent can apply, and the obvious candidate format (`DESIGN.md`, from [google-labs-code/design.md](https://github.com/google-labs-code/design.md)) collides with this repository's own [`DESIGN.md`](../../../../DESIGN.md), which is the product design record.

## Proposal

**Direction: ink and paper, neutral-first.** Paper/ink neutrals as the base, the system accent colour as the single accent, hairline structure, flat surfaces with no gradients, system fonts throughout, small radii, shadows only for overlays, keyboard-first interaction.

1. **Colour base: flexoki (MIT), as a neutral base only.** Its intent — "inky colour scheme … inspired by analog printing inks and warm shades of paper" — matches the direction, and it ships 15 warm neutral steps plus eight hue families at twelve steps each, with light and dark designed as a pair (measured: ink on paper 18.62:1, light on dark 15.04:1). That ramp density is what lets six badge states stay both distinguishable and WCAG-checkable. The accent is **not** chosen from flexoki; flexoki supplies same-hue fallback steps when the system accent fails contrast.
2. **The accent is the Windows accent colour plus a contrast-correction layer.** The layer is part of the direction, not an implementation detail: compute contrast against the current ground per purpose (fill ≥ 4.5, graphic/border ≥ 3.0, text ≥ 4.5); when it fails, substitute the same-hue flexoki step (blue path → `#205EA6` on paper 6.36:1 / `#4385BE` on dark 4.37:1; orange path → `#BC5215` / `#DA702C`); if even that fails, warn rather than silently degrade. The accent is therefore used on **fills** — buttons, selected rows, progress — and hairline/focus emphasis is derived independently so a low-contrast system theme cannot erase the focus ring.
3. **Both modes are designed together**, since the mode follows the system. Mica is a tinted composite: panel grounds get their own opaque layer rather than contrasting against the composited backdrop.
4. **Structure rules from taste-skill's "Swiss Industrial Print" archetype (MIT, prompt-level rules only):** visible structural dividing lines instead of card shadows, one accent, disciplined grid, oversized type reserved for real landmarks. Its sibling archetype, "Tactical Telemetry & CRT Terminal", is deliberately **not** adopted as a look; only its density and monospace discipline are taken, for log and raw-data surfaces. Modules get density zones, not skins: shell, lists, forms and settings use the Swiss-derived structure at 36/32 px row heights (14 px body text), while logs, progress detail, cleanup path lists and history records use a 24 px monospace zone inside the same frame. Splitting the *look* between the two archetypes is what the reference material forbids; a data-dense region inside one archetype is not that.
5. **Fonts are system-only:** `Segoe UI Variable` for Latin, `Microsoft YaHei UI` for Chinese, `Cascadia Mono` → `Consolas` for versions, paths, logs, and byte counts, at a 14 px body baseline. No bundled webfont in either script. Windows has no monospace CJK face, so monospace alignment applies to Latin text and digits only — the design never pretends a Chinese column is aligned. Layout scales with the system DPI setting rather than forcing text-only scaling.
6. **Keyboard-first is a layout constraint, not an add-on:** the focus ring is a first-class visual element, a command palette (`Ctrl+K`) is the full-keyboard entry point, the shortcut table belongs in settings, and the density ceiling is set by keyboard reachability — a row action reachable only by mouse counts as a defect.
7. **The visual identity gets a ruled home:** written in the design.md format (Apache-2.0) as `docs/visual-identity.md` — YAML front matter for tokens plus ordered prose for rationale — because that format is lintable (`npx @google/design.md lint`) and its linter checks WCAG contrast and token references, the one automated guarantee this direction needs. The filename avoids the collision with the repository's `DESIGN.md`.
8. **Aesthetic vocabulary, not decoration:** the Rinpa entry of the Visual Style Atlas (gold-and-ink, flatness, continuous composition, botanical ornament) contributes flat planes, warmth confined to the neutral base, and repeating hairline dividers standing in for continuous composition. No ornament, texture, or imagery is copied, and its "gold" is explicitly *not* translated into a coloured accent, because the accent belongs to the system.

The full evidence per reference, the combination rules, and the rejection list are in [docs/style-direction.md](../../../../docs/style-direction.md).

## Alternatives considered

- **A single warm accent chosen from flexoki** (the direction's first draft). Rejected once the author confirmed the accent should follow Windows: a fixed warm accent is a colour choice that cannot track a system setting, and a blue system accent on a warm ground is the combination most likely to read as dirty.
- **Ignore the system accent, use a fixed brand colour.** Rejected by the same confirmation; it would also make the focus ring and selection colour disagree with every other window on the machine.
- **Adopt ui-design-agent-kit's palette (`ink #111313` + `lime #d4ff3f` + `coral #ff795d`).** Rejected twice over: the repository states it is maintained as an internal tool with no SPDX licence, so nothing from it is reusable, and its neon accent pair is the "cheap neon / AI dev-tool" look that taste-skill's anti-generic rules name. Its *workflow* (requirement → reference → confirmed design → browser verification, with screenshots as evidence) is worth following, and that is all that is taken.
- **Full telemetry/CRT look.** Rejected: scanline and phosphor styling reads as a costume on a tool used daily, and its monospace premise is unachievable in Chinese on Windows.
- **Editorial/marketing composition** (the Florio example's hero scale, the showcase gallery's display type). Rejected for both the application and the documentation, since the author declined a separate editorial treatment for docs and README.
- **Deciding later, when the pages are being built.** Rejected: the direction constrains structure — row heights, divider-versus-shadow, type roles, focus styling — and a constraint discovered after the first screen exists is a rewrite.

## Acceptance criteria

- `docs/style-direction.md` names one primary direction, one module-level treatment, one fallback, and an explicit not-adopt list, each traceable to observable evidence in a reference (README text, tokens, screenshots, licence, activity) — and the eight confirmed constraints are recorded as decisions rather than left open.
- Every constraint the direction imposes is checkable: no font files in the bundle; one accent per surface; state colours 1:1 with the badges in [docs/ui.md](../../../../docs/ui.md#row-states); contrast measured in both modes by the design.md linter, including the system-accent correction path; the focus ring visible under a low-contrast accent theme.
- No implementation lands in this round: no `src/` changes, no token files, no components.
- When the identity is written as `docs/visual-identity.md` and linted, this note moves to `implemented/`.

## Risks

- **Warm neutrals with a blue accent can read as dirty.** Mitigated, not eliminated, by pulling the light ground from pure warm toward neutral (toward `#F2F0E5`); the final value is an empirical decision, not a token copied from the reference.
- **Mica composites with whatever is behind the window**, so contrast measured against the theme colour is not contrast on screen. Panel grounds must be opaque or deliberately layered, and the check is a screenshot under a wallpaper, not a calculation.
- **The system accent can be any hue and any contrast.** The correction layer converts an unverifiable input into a verified token, but it is code that must exist before the first component uses the accent — a component that reads the raw accent is a defect.
- **Keyboard-first raises the density floor.** Every row action needs a keyboard path, which costs layout width and screen real estate in a window whose main content is a list.
- **The references are not a design system.** Only flexoki provides reusable tokens; the others contribute rules, evidence, or vocabulary. Treating taste-skill or Rinpa as a component source is out of scope for this note.
- **The filename collision is easy to reintroduce.** The design.md format is called `DESIGN.md`; this repository's `DESIGN.md` is the product design. Only `docs/visual-identity.md` is the visual identity.
