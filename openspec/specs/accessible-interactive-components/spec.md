### Requirement: SegmentedControl conforms to WAI-ARIA toggle button group pattern
The SegmentedControl container SHALL have `role="group"` and an `aria-label` prop describing the group. Each option button SHALL have `aria-pressed` set to `true` when active and `false` when inactive.

#### Scenario: Active option is announced as pressed
- **WHEN** SegmentedControl renders with `value="hitter"`
- **THEN** the "hitter" button has `aria-pressed="true"`
- **THEN** the "pitcher" button has `aria-pressed="false"`

#### Scenario: Group has descriptive label
- **WHEN** SegmentedControl renders with `aria-label="Player type"`
- **THEN** the container element has `role="group"` and `aria-label="Player type"`

### Requirement: SettingsPanel tabs conform to WAI-ARIA tabs pattern
The tab list container SHALL have `role="tablist"`. Each tab button SHALL have `role="tab"`, `aria-selected` (true/false), and `aria-controls` pointing to the corresponding panel `id`. The active tab panel SHALL have `role="tabpanel"` and `aria-labelledby` pointing to its tab button `id`.

#### Scenario: Active tab is announced as selected
- **WHEN** SettingsPanel renders with the "leagues" tab active
- **THEN** the "Leagues" button has `role="tab"` and `aria-selected="true"`
- **THEN** the "Categories" and "Preferences" buttons have `aria-selected="false"`

#### Scenario: Tab panel is linked to its tab
- **WHEN** SettingsPanel renders
- **THEN** the active panel has `role="tabpanel"` and `aria-labelledby` matching the active tab button's `id`

### Requirement: Page background respects prefers-reduced-motion
The application SHALL not apply CSS transitions or animations when the user has enabled the "reduce motion" system preference.

#### Scenario: Motion disabled by user preference
- **WHEN** the CSS media query `(prefers-reduced-motion: reduce)` is active
- **THEN** all elements have `transition: none` and `animation: none` applied
