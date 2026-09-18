---
version: alpha
name: Upkeep
description: A local Windows console for application updates and the residue updaters leave behind. Ink-and-paper neutrals, hairline structure, flat surfaces, and the Windows system accent colour as the only accent.
colors:
  primary: "#205EA6"
  paper: "#FFFCF0"
  paper-raised: "#F2F0E5"
  paper-sunken: "#E6E4D9"
  dark: "#1C1B1A"
  dark-raised: "#282726"
  ink: "#100F0F"
  ink-muted: "#575653"
  ink-subtle: "#878580"
  on-dark: "#F2F0E5"
  on-dark-muted: "#B7B5AC"
  rule: "#CECDC3"
  rule-dark: "#403E3C"
  rule-strong: "#B7B5AC"
  wash-hover: "#0F000000"
  wash-pressed: "#18000000"
  wash-selected: "#14000000"
  state-pending: "#BC5215"
  state-current: "#536907"
  state-unknown: "#6F6E69"
  state-failed: "#C03E35"
  state-verify-failed: "#B74583"
  state-skipped: "#1C6C66"
  state-pending-dark: "#DA702C"
  state-current-dark: "#768D21"
  state-unknown-dark: "#878580"
  state-failed-dark: "#E8705F"
  state-verify-failed-dark: "#CE5D97"
  state-skipped-dark: "#2F968D"
  scrim: "rgba(0, 0, 0, 0.4)"
typography:
  body:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Microsoft YaHei UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Microsoft YaHei UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Microsoft YaHei UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.35
  page-title:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Microsoft YaHei UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
  mono:
    fontFamily: "Cascadia Mono, Consolas, Courier New, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px
components:
  window:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  window-dark:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.on-dark}"
  panel:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  panel-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
  divider:
    backgroundColor: "{colors.rule}"
    size: 1px
  divider-dark:
    backgroundColor: "{colors.rule-dark}"
    size: 1px
  section-raised:
    backgroundColor: "{colors.paper-sunken}"
    textColor: "{colors.ink}"
  section-raised-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.on-dark}"
  text-secondary:
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
  text-secondary-dark:
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.caption}"
  text-subtle:
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
  overlay-scrim-layer:
    backgroundColor: "{colors.scrim}"
  row-list:
    height: 36px
    padding: "{spacing.2}"
    rounded: "{rounded.sm}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  row-list-dark:
    height: 36px
    padding: "{spacing.2}"
    rounded: "{rounded.sm}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body}"
  row-list-hover:
    backgroundColor: "{colors.wash-hover}"
  row-list-pressed:
    backgroundColor: "{colors.wash-pressed}"
  row-list-selected:
    backgroundColor: "{colors.wash-selected}"
  focus-ring:
    backgroundColor: "{colors.rule-strong}"
    size: 2px
  row-table:
    height: 32px
    padding: "{spacing.2}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  row-table-dark:
    height: 32px
    padding: "{spacing.2}"
    textColor: "{colors.on-dark}"
    typography: "{typography.label}"
  row-path:
    height: 24px
    padding: "{spacing.1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
  row-path-dark:
    height: 24px
    padding: "{spacing.1}"
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.mono}"
  badge-pending:
    backgroundColor: "{colors.state-pending}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-pending-dark:
    backgroundColor: "{colors.state-pending-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  badge-current:
    backgroundColor: "{colors.state-current}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-current-dark:
    backgroundColor: "{colors.state-current-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  badge-unknown:
    backgroundColor: "{colors.state-unknown}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-unknown-dark:
    backgroundColor: "{colors.state-unknown-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  badge-failed:
    backgroundColor: "{colors.state-failed}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-failed-dark:
    backgroundColor: "{colors.state-failed-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  badge-verify-failed:
    backgroundColor: "{colors.state-verify-failed}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-verify-failed-dark:
    backgroundColor: "{colors.state-verify-failed-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  badge-skipped:
    backgroundColor: "{colors.state-skipped}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  badge-skipped-dark:
    backgroundColor: "{colors.state-skipped-dark}"
    textColor: "{colors.dark}"
    rounded: "{rounded.sm}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "{spacing.2}"
    height: 32px
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.2}"
    height: 32px
  overlay:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
  overlay-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
---

# Upkeep — visual identity

This file is the token home for everything `src/styles/` and the panels draw with. [style-direction.md](style-direction.md) owns the *direction and its constraints* — the references, the rejected options, and why the accent is the system's; this file owns the *values*, and they are normative wherever prose and tokens disagree. Row states come from [ui.md](ui.md#row-states) and are bound here one to one.

Read this file as the answer to "what value do I use", and style-direction.md as the answer to "why this direction and not another".

## Colors

The palette is flexoki's neutral ramp as the ground and its hue ramps only where a state must be distinguishable. There is no brand colour: the single accent is the Windows system accent, corrected at runtime by the layer described below.

The token values below are copied from flexoki — MIT, Copyright © 2023 Steph Ango ([repository](https://github.com/kepano/flexoki), commit `8d723ba`; the reference copy is `_recon/quoted/flexoki.css`). That licence travels with the values: keeping the notice here is the condition of copying them, and a hue that is added later from the same source carries it too. Everything else in this direction is a constraint written for this project, not a borrowed asset.

- **paper (#FFFCF0):** the light ground. Warm, but deliberately pulled toward neutral — a blue system accent on a warm ground is the combination that reads as dirty, so the warmth is confined to the neutral base and never extended into a tinted panel.
- **ink (#100F0F):** body text on paper, 18.62:1 against it. Also the glyph colour on accent fills where the fill is light.
- **ink-muted (#575653) / ink-subtle (#878580):** secondary text and metadata. `ink-muted` is the default for text a reader is expected to read (7.14:1 on paper). `ink-subtle` measures 3.59:1 on paper — **below AA for small text** — so it is reserved for non-essential marks such as an inactive icon or a disabled row, never for a label carrying meaning. The lighter base steps are worse still (base-400 2.64:1, base-300 2.00:1) and are ground-side values only. This is why the direction forbids picking a grey by eye. On the dark ground the ramp inverts: `on-dark-muted` (#B7B5AC) is the secondary text colour at 8.37:1, and the base-400..600 steps all clear AA there.
- **rule (#CECDC3) / rule-strong (#B7B5AC):** hairlines. A 1px `rule` divides rows and panel sections; `rule-strong` is reserved for the boundary of an overlay, where a 1px line sits over content rather than beside it.
- **wash-\*:** hover, pressed, and selected are the *same neutral at one alpha step*, never a coloured tint — the ladder is in Elevation & Depth. Each is written as `#AARRGGBB` so it composites over both grounds without a second pair of tokens.
- **The six state colours** are below, one per badge in [ui.md](ui.md#row-states).

### State colours (one to one with the badges)

Every pair was computed against its own ground and clears WCAG AA for small text (≥4.5:1); the step chosen is the *most saturated passing step*, so a badge is as vivid as the ratio allows and no more. Recompute rather than eyeball if a value changes.

| Badge | Light on `paper` | ratio | Dark on `dark ground` | ratio |
|---|---|---|---|---|
| `待更新` | orange-600 `#BC5215` | 4.69 | orange-400 `#DA702C` | 5.19 |
| `最新` | green-700 `#536907` | 6.03 | green-500 `#768D21` | 4.59 |
| `未知` | base-600 `#6F6E69` | 4.97 | base-500 `#878580` | 4.67 |
| `失败` | red-500 `#C03E35` | 5.13 | red-300 `#E8705F` | 5.66 |
| `校验失败` | magenta-500 `#B74583` | 4.87 | magenta-400 `#CE5D97` | 4.62 |
| `已跳过` | cyan-700 `#1C6C66` | 6.03 | cyan-500 `#2F968D` | 4.81 |

A state with no colour is not a state: adding a badge means adding a row here and a measured ratio, and removing a badge removes its row in the same change.

### The accent and its correction layer

The accent is the Windows accent colour, read from the system, and **it is a fill colour only** — button backgrounds, selected rows, progress bars. It is never a hairline, never small text, and never an icon stroke, because the default `#0078D4` measures 3.80:1 on the dark ground and 4.41:1 on paper, both below AA for those purposes ([evidence](style-direction.md#两个必须遵守的实测结论)).

The layer is a function, not a table: given the accent, the current ground, and the purpose, it returns a usable value or warns.

| Purpose | Threshold | When the system accent fails |
|---|---|---|
| fill behind text | ≥4.5:1, and pick white or ink by whichever is better | map to the same-hue flexoki step: blue → `#205EA6` on paper (6.54:1 with white text) / `#66A0C8` on the dark ground (6.08:1) |
| graphic, border, focus ring | ≥3.0:1 | same mapping, lower threshold |
| text | ≥4.5:1 | same mapping, and if even that fails, warn — never silently degrade |

Two consequences worth stating plainly, because both are load-bearing:

- **The focus ring does not depend on the accent.** Its visibility is derived independently (see Do's and Don'ts), so a low-contrast system theme cannot erase it.
- **A component that reads the raw accent is a defect.** It is the corrected token or nothing.

## Typography

System fonts only, in both scripts. No webfont ships with this application: a CJK face costs 5–20 MB and contradicts a tool whose premise is that it stays local, and mixing a bundled display face with CJK system text is the inconsistency the direction already refused.

- **Body** is 14px — the Chinese-text baseline confirmed in the direction, not a Western default.
- **Mono** (`Cascadia Mono`, falling back to `Consolas`) carries versions, paths, log lines, and byte counts, with tabular figures so a column of version numbers aligns.
- **Chinese has no monospace face on Windows.** Mono alignment therefore applies to Latin text and digits only, and a column of Chinese is never pretended to be aligned.

## Layout

An 8px grid with a 4px half-step, no exceptions for "just this once". Density is set by three row heights rather than by padding: a list row is 36px, a table row 32px, and a path row 24px inside the instrument surface.

The window is single-column and single-window — no docked panels, no second window — so the layout has no breakpoint system to maintain. It scales with the system DPI setting rather than forcing text-only scaling, which means a row that is 36px at 100% is 54px at 150%, and the density rules are stated in px at 100%.

## Elevation & Depth

**There is no elevation.** Nothing floats above the page except overlays, and hierarchy is carried by three flat devices instead:

- **Hairlines.** A 1px `rule` line separates rows and sections. Structure is drawn, not implied by a shadow.
- **Surface steps.** `paper` → `paper-raised` → `paper-sunken` are the only three grounds, and a step is worth one level of hierarchy exactly once.
- **Neutral alpha washes.** Hover, pressed, and selected are the same ink at increasing alpha over whatever ground is beneath: hover `wash-hover`, pressed `wash-pressed`, selected `wash-selected`. **This is the one technique taken from DeskBox's implementation after reading it**: a single neutral ladder composites correctly over every ground and every state colour, where a per-state tint would need one pair per state per mode and would drift.

The only shadow in the entire application belongs to an overlay (a modal, a menu, a popover), and an overlay is the only place `scrim` appears.

## Shapes

Three radii, no more: `sm` 4px for rows and controls, `md` 6px for cards and panels, `lg` 8px for overlays. A radius outside this set is a typo, not a decision. Nothing is fully rounded — a pill is a shape this application does not have.

## Components

Only the primitives the direction fixes; the rest arrive with the panels that need them, and each addition is a token group here rather than a value inlined in a component.

- **Rows** are the application's main primitive: 36px in a list, 32px in a table, 24px in the instrument surface. Selection is `wash-selected` plus a 2px accent fill on the leading edge — the one place a fill-role accent reaches a row.
- **Badges** take their colour from the state table above, one to one with [ui.md](ui.md#row-states), and never introduce a colour of their own.
- **Buttons** split into destructive and non-destructive by shape: a destructive action carries the accent fill and requires a preview, a non-destructive one is a hairline button on the ground.
- **The instrument surface** is the monospace density zone: 24px rows, right-aligned tabular figures, fixed column widths, horizontal scroll. It does not leak into settings, the history table, or any form.

## Do's and Don'ts

- Do use the accent for at most one primary action per screen.
- Do derive the focus ring from `rule-strong` and the accent's corrected value together — outer 2px, inner 1px — so it stays visible under a low-contrast system theme.
- Do measure a new state colour in both modes before it lands; state the ratio beside the value.
- Do keep a row action reachable by keyboard. A row action that only a mouse can reach is a defect, not a missing nicety.
- Don't paint the system accent as a hairline, small text, or an icon stroke.
- Don't add a fourth ground or a fourth radius.
- Don't put a coloured tint in a hover or selected state; the ladder is neutral.
- Don't let the instrument surface leak outside logs, paths, and raw data.
