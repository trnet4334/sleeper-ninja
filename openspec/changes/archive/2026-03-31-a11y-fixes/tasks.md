## 1. CSS: prefers-reduced-motion

- [x] 1.1 Add `@media (prefers-reduced-motion: reduce)` block to `src/styles/index.css` disabling all transitions and animations

## 2. SegmentedControl: ARIA toggle group

- [x] 2.1 Add `role="group"` and `aria-label` prop to SegmentedControl container div
- [x] 2.2 Add `aria-pressed` to each option button in SegmentedControl

## 3. SettingsPanel: ARIA tabs pattern

- [x] 3.1 Add `role="tablist"` to the tab button container in SettingsPanel
- [x] 3.2 Add `role="tab"`, `id`, `aria-selected`, `aria-controls` to each tab button
- [x] 3.3 Wrap each tab panel content in a div with `role="tabpanel"`, `id`, and `aria-labelledby`

## 4. LeagueManager: Labeled form inputs

- [x] 4.1 Add visually-hidden `<label>` for "New league name" input in LeagueManager
- [x] 4.2 Add visually-hidden `<label>` for "Yahoo league ID" input in LeagueManager

## 5. LeagueTabBar: Labeled form inputs + tab aria-selected

- [x] 5.1 Add visually-hidden `<label>` for "League name" input in LeagueTabBar
- [x] 5.2 Add visually-hidden `<label>` for "Yahoo ID" input in LeagueTabBar
- [x] 5.3 Add `aria-selected` to league tab buttons in LeagueTabBar

## 6. AppShell: aria-expanded + sidebar label

- [x] 6.1 Add `aria-expanded={mobileNavOpen}` to Menu button in AppShell
- [x] 6.2 Add `aria-label="Main navigation"` to `<aside>` in AppShell

## 7. SleeperReport: Table + keyboard + aria-live

- [x] 7.1 Add `scope="col"` to all `<th>` elements in the player table
- [x] 7.2 Add `tabIndex={0}` and `onKeyDown` handler to player `<tr>` elements
- [x] 7.3 Wrap the loading message in an `aria-live="polite"` region

## 8. Verify

- [x] 8.1 Run `npm run test` — all tests pass
- [x] 8.2 Run `npm run build` — no errors
- [x] 8.3 Run `npm run lint` — no errors
