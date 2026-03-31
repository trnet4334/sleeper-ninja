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

### Requirement: Projected Delta card
The page SHALL display a "Projected Delta" card using the `primary-container` background color, showing a large net value number (e.g. "+8.4"), an "ACCEPT TRADE" button, and a methodology footnote.

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

### Requirement: Category Comparison bars
The page SHALL display a "Category Comparison" section with one row per scoring category from `useCategories`. Each row SHALL show: the category name, a delta badge (e.g. "+18%" in primary or "–4%" in error tone), a dual-segment progress bar (base fill + delta fill), and a short description text.

#### Scenario: Category rows render
- **WHEN** `useCategories` returns hitter categories
- **THEN** each hitter category appears as a row with a progress bar and delta label

#### Scenario: Positive delta shown in primary color
- **WHEN** a category has a positive delta value
- **THEN** the delta badge uses primary amber color

#### Scenario: Negative delta shown in error color
- **WHEN** a category has a negative delta value
- **THEN** the delta badge uses the error/rose color token

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the Trade Analyzer page is displayed
- **THEN** the top nav and side nav render identically to all other pages
