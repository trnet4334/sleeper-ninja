## Context

A technical audit identified 8 categories of accessibility violations across the application. None of the changes require new dependencies or structural refactoring — they are attribute additions, element swaps, and CSS additions. All fixes are targeted and self-contained per component.

Affected files:
- `src/components/settings/LeagueManager.tsx` — inputs missing `<label>`
- `src/components/layout/LeagueTabBar.tsx` — inputs missing `<label>`, league tab buttons missing `aria-selected`
- `src/components/ui/SegmentedControl.tsx` — missing `role="group"`, `aria-label`, `aria-pressed`
- `src/components/settings/SettingsPanel.tsx` — tabs missing `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `id`
- `src/components/layout/AppShell.tsx` — mobile drawer missing focus trap and `aria-expanded`; `<aside>` needs `aria-label`
- `src/pages/SleeperReport.tsx` — `<th>` missing `scope="col"`, `<tr onClick>` not keyboard accessible, no `aria-live` region
- `src/styles/index.css` — no `prefers-reduced-motion` support

## Goals / Non-Goals

**Goals:**
- Achieve WCAG 2.1 AA compliance across all audited components
- Fix all P0/P1 violations identified in the audit
- No regressions to existing functionality or visual design

**Non-Goals:**
- Fixing accessibility in pages other than SleeperReport (MyRoster, H2HMatchup, etc.) — addressed in a follow-up
- Adding comprehensive ARIA live regions to all pages
- Implementing full skip-to-main-content link (P3 — future pass)

## Decisions

**Form labels: visually hidden `<label>` elements (not `aria-label` on inputs)**

Visually hidden labels (`sr-only` Tailwind class) are preferred over `aria-label` on input elements because they associate correctly with the input for programmatic labelling and work better with voice dictation software (Dragon NaturallySpeaking). The visual design is preserved.

**SegmentedControl: `role="group"` wrapper + `aria-pressed` per button**

The WAI-ARIA pattern for a set of toggle buttons uses `role="group"` on the container with `aria-label` describing the group, and `aria-pressed` on each individual button. This is simpler and more widely supported than the `radiogroup`/`radio` pattern for a control that switches between views.

**SettingsPanel tabs: full WAI-ARIA tabs pattern**

`role="tablist"` on the container, `role="tab"` + `aria-selected` + `aria-controls` on each tab button, and `role="tabpanel"` + `id` on the content area. The tab buttons also need unique `id` attributes for the `aria-labelledby` on the panel.

**AppShell drawer: CSS focus trap via `inert` attribute**

When the mobile drawer is closed, set `inert` on the main content area to prevent keyboard access to hidden elements. When open, set `inert` on the main content. `inert` is now baseline across all modern browsers (2023+) and is simpler than a JavaScript focus trap loop.

**SleeperReport table rows: `tabIndex={0}` + `onKeyDown` Enter/Space**

`<tr>` cannot be replaced with `<button>` inside a `<tbody>` (invalid HTML). The correct pattern is `tabIndex={0}` + `role="row"` (already implied) + `onKeyDown` handler that fires `onClick` on Enter and Space.

**prefers-reduced-motion: global CSS rule**

One `@media (prefers-reduced-motion: reduce)` block in `index.css` covering `*` with `transition: none` and `animation: none` is the simplest approach. It applies globally and doesn't require touching individual components.

## Risks / Trade-offs

- [`inert` browser support] → Baseline 2023; all modern browsers. Safari 15.5+. Not a concern for this app.
- [Focus trap via `inert` resets scroll position] → No scroll state is maintained on the sidebar, so no impact.
- [Keyboard-navigable table rows feel unusual] → Standard pattern for interactive data rows. `tabIndex={0}` puts rows in natural tab order.

## Migration Plan

Fix components one at a time in dependency order (independent components first, then page-level components):
1. `index.css` — `prefers-reduced-motion`
2. `SegmentedControl.tsx`
3. `SettingsPanel.tsx`
4. `LeagueManager.tsx`
5. `LeagueTabBar.tsx`
6. `AppShell.tsx`
7. `SleeperReport.tsx`

Run `npm run test` and `npm run build` after each to catch regressions immediately.
