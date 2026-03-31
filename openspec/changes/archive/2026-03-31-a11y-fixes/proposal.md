## Why

A technical audit identified widespread WCAG AA violations across the application: form inputs have no `<label>` elements, interactive components lack required ARIA roles and states, table rows are non-keyboard-navigable `<div>` elements, and the mobile navigation drawer has no focus management. Screen reader users and keyboard-only users cannot effectively use the product in its current state.

## What Changes

- Add `<label>` elements (or `aria-label`) to all form inputs in `LeagueManager.tsx` and `LeagueTabBar.tsx` — currently only placeholders are used
- Add `role="group"` + `aria-label` to `SegmentedControl`, and `aria-pressed` on each option button
- Rewrite `SettingsPanel.tsx` tab bar with proper `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` / `id` attributes
- Implement focus trap in the `AppShell.tsx` mobile nav drawer; restore focus to the trigger button on close
- Add `scope="col"` to all `<th>` elements in data tables (`SleeperReport.tsx`, `StatExplorer.tsx`)
- Convert clickable `<div>` table rows to keyboard-accessible elements (`<button>` or `role="row"` + `tabIndex={0}` + `onKeyDown`)
- Add `aria-live="polite"` regions to pages that display async-loaded data so screen readers announce updates
- Add `@media (prefers-reduced-motion: reduce)` block to `src/styles/index.css` disabling all transitions and animations

## Capabilities

### New Capabilities

- `accessible-forms`: All form inputs in the settings and league management UI are labelled and operable via screen reader
- `accessible-interactive-components`: SegmentedControl and SettingsPanel tab bar conform to WAI-ARIA patterns for toggles and tab interfaces
- `keyboard-navigation`: Player table rows, mobile nav drawer, and all interactive surfaces are fully operable by keyboard

### Modified Capabilities

_(no spec-level requirement changes — this adds requirements that were missing)_

## Impact

**Files modified:**
- `src/components/settings/LeagueManager.tsx`
- `src/components/layout/LeagueTabBar.tsx`
- `src/components/ui/SegmentedControl.tsx`
- `src/components/settings/SettingsPanel.tsx`
- `src/components/layout/AppShell.tsx`
- `src/pages/SleeperReport.tsx`
- `src/pages/StatExplorer.tsx`
- `src/styles/index.css`

**No new dependencies required.** Changes are structural HTML/ARIA attributes and CSS media query additions.
