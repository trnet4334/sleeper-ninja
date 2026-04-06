### Requirement: Giving Up card
The page SHALL display a "Giving Up" card with an error-tone header, a list of up to 2 players being traded away (name, position, team, projected value), and a "Total Value Out" footer showing the sum of projected values.

#### Scenario: Giving Up card renders players
- **WHEN** the Trade Analyzer page loads and roster data is available
- **THEN** up to 2 "giving up" players appear with their name, position, team, and a projected value label

#### Scenario: Giving Up card shows total
- **WHEN** players are shown in the Giving Up section
- **THEN** a "Total Value Out" label with a numeric value appears at the bottom of the card

### Requirement: Receiving card
The page SHALL display a "Receiving" card with a primary amber-tone header, a list of up to 2 players being received (name, position, team, projected value), and a "Total Value In" footer.

#### Scenario: Receiving card renders players
- **WHEN** the Trade Analyzer page loads and waiver data is available
- **THEN** up to 2 "receiving" players appear with name, position, team, and projected value

#### Scenario: Receiving card shows total
- **WHEN** players are shown in the Receiving section
- **THEN** a "Total Value In" label with a numeric value appears at the bottom of the card

### Requirement: Projected Delta card shows live trade_net

The Projected Delta card SHALL display the live `trade_net` value (formatted with leading `+` or `–`) from `useTradeScoring`, replacing any hardcoded value. The card uses the `primary-container` background color, includes an "ACCEPT TRADE" button, and a methodology footnote.

#### Scenario: Live value updates on player change
- **WHEN** a player is added or removed from either side
- **THEN** the large net value string in the Projected Delta card updates immediately

#### Scenario: Projected Delta displays net value
- **WHEN** the Trade Analyzer page loads
- **THEN** a large formatted net value string (with leading "+" or "–") is visible in the delta card

#### Scenario: Projected Delta card uses amber background
- **WHEN** the Projected Delta card renders
- **THEN** the card background uses the `bg-primary-container` token (amber tone), distinguishing it from the other two cards

### Requirement: Team Strength Impact radar
The page SHALL display a "Team Strength Impact" section with an inline SVG pentagon radar showing two polygon fills: a grey pre-trade polygon and an amber post-trade polygon. The radar SHALL have four axis labels: Efficiency, Health, Upside, Schedule. A legend SHALL identify pre-trade and post-trade lines.

#### Scenario: Radar SVG renders
- **WHEN** the Trade Analyzer page loads
- **THEN** an SVG element is visible containing at least two polygon elements and four text axis labels

#### Scenario: Legend is visible
- **WHEN** the radar section renders
- **THEN** "PRE-TRADE" and "POST-TRADE" labels with corresponding color indicators are shown

### Requirement: Category Comparison rows driven by getCatDeltas

The Category Comparison section SHALL render one row per entry from `getCatDeltas()` output. Each row shows the category name, a delta badge, and a dual-segment progress bar with widths proportional to the delta magnitude.

#### Scenario: Category rows render
- **WHEN** `useCategories` returns hitter categories
- **THEN** each hitter category appears as a row with a progress bar and delta label

#### Scenario: Positive delta row renders primary color badge
- **WHEN** `catDeltas` entry has `delta > 0`
- **THEN** the badge text is `+{delta.toFixed(2)}` in primary amber color

#### Scenario: Negative delta row renders error color badge
- **WHEN** `catDeltas` entry has `delta < 0`
- **THEN** the badge text is `{delta.toFixed(2)}` in rose/error color

#### Scenario: Weakness badge shown
- **WHEN** `is_my_weakness === true`
- **THEN** a small `缺口` badge appears next to the category name

#### Scenario: Strength badge shown
- **WHEN** `is_my_strength === true`
- **THEN** a small `優勢` badge appears next to the category name

---

### Requirement: Pros section

Below the Category Comparison, the page SHALL display a "優點" (Advantages) section with up to 3 bullet points from `getAdvantages()`. Each point has a checkmark icon and text.

#### Scenario: Section hidden when no advantages
- **WHEN** `getAdvantages()` returns an empty array
- **THEN** the pros section is not rendered

---

### Requirement: Cons section

Below Pros, a "缺點" (Disadvantages) section SHALL display up to 3 bullet points from `getDisadvantages()`. Each point has an × icon and text.

#### Scenario: Section hidden when no disadvantages
- **WHEN** `getDisadvantages()` returns an empty array
- **THEN** the cons section is not rendered

---

### Requirement: Risk flags section

A "風險警示" section SHALL render each flag from `getRiskFlags()` with color-coded severity indicators:
- High: rose/red badge
- Medium: amber badge
- Low: secondary/muted badge

#### Scenario: Section hidden when no flags
- **WHEN** `getRiskFlags()` returns an empty array
- **THEN** the risk flags section is not rendered

---

### Requirement: Negotiation hint section

A "談判建議" section SHALL show the string from `getNegotiationHint()` in a distinct card (primary-container background).

#### Scenario: Section shown only for small deficit
- **WHEN** `-1.0 < trade_net < 0`
- **THEN** the negotiation hint section is visible

#### Scenario: Section hidden otherwise
- **WHEN** `trade_net >= 0` or `trade_net <= -1.0`
- **THEN** the negotiation hint section is not rendered

### Requirement: 12-column bento grid first row
The Trade Analyzer page SHALL use a 12-column CSS grid for the first row, with the Giving Up card spanning 4 columns, the Receiving card spanning 4 columns, and the Projected Delta card spanning 4 columns on large screens. On small screens all three stack vertically.

#### Scenario: Three-card first row layout on large screen
- **WHEN** the Trade Analyzer page loads on a viewport ≥ 1024px
- **THEN** Giving Up, Receiving, and Projected Delta cards are shown side-by-side in equal 4-column widths

### Requirement: Team Strength Impact + Category Comparison second-row split
The second row SHALL use an 8-column left section for Team Strength Impact and a 4-column right section for Category Comparison on large screens.

#### Scenario: Second row 8/4 split on large screen
- **WHEN** the Trade Analyzer page loads on a viewport ≥ 1024px
- **THEN** the radar section occupies roughly two-thirds of the width and the category comparison occupies one-third

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the Trade Analyzer page is displayed
- **THEN** the top nav and side nav render identically to all other pages
