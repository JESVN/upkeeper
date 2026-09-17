# `src/styles/`

The Tailwind v4 entry point and the theme tokens the panels use.

- `tailwind.css` imports Tailwind and declares the design tokens (colours for the row states, spacing scale, typography) as custom properties.
- A component uses utilities and tokens; a raw colour value or a magic spacing number in a component is replaced by a token in the same change.
- The state colours for `待更新`, `最新`, `未知`, `失败`, `校验失败`, and `已跳过` are defined here once, so a badge cannot drift from the panel that shows the same state.
- Dark mode and density, if added, are tokens here — not conditional class strings scattered across panels.
