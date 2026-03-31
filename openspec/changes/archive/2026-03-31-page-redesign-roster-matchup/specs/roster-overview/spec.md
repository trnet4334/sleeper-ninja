## ADDED Requirements

### Requirement: Summary stat cards
The page SHALL display four summary cards at the top: Roster Health (%), Active Grid (N/12 active players), Waiver Priority (#N), and FAAB Balance ($N). Cards use the `surface-container-low` token with an amber accent label.

#### Scenario: Cards render with placeholder values
- **WHEN** the My Roster page loads
- **THEN** four summary cards are visible with labels "Roster Health", "Active Grid", "Waiver Priority", and "FAAB"

#### Scenario: Cards render within the page content area
- **WHEN** the My Roster page loads
- **THEN** the cards appear inside the main content section, not affecting the top nav or side nav

### Requirement: Hitters table
The page SHALL render a structured hitters table with columns: Pos, Player (name), AVG, HR, RBI, SB, Status. Each row corresponds to one hitter from `useRosterData("hitter")`.

#### Scenario: Hitters table populated
- **WHEN** `useRosterData("hitter")` returns a non-empty list
- **THEN** each hitter appears as a row with position badge, player name, and stat values

#### Scenario: IL player row dimmed
- **WHEN** a hitter's `rosterState` indicates injury (IL)
- **THEN** the row renders with reduced opacity and an error-tone status badge

#### Scenario: Empty hitters list
- **WHEN** `useRosterData("hitter")` returns an empty list
- **THEN** the hitters section shows an empty-state message

### Requirement: Pitchers table
The page SHALL render a structured pitchers table below the hitters table, with columns: Pos, Player (name), ERA, WHIP, K, W-S (wins-saves), Status. Each row corresponds to one pitcher from `useRosterData("pitcher")`.

#### Scenario: Pitchers table populated
- **WHEN** `useRosterData("pitcher")` returns a non-empty list
- **THEN** each pitcher appears as a row with role badge (SP/RP/CL), player name, and stat values

#### Scenario: IL pitcher row dimmed
- **WHEN** a pitcher's `rosterState` indicates injury (IL)
- **THEN** the row renders with reduced opacity and an error-tone status badge

#### Scenario: Empty pitchers list
- **WHEN** `useRosterData("pitcher")` returns an empty list
- **THEN** the pitchers section shows an empty-state message

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the My Roster page is displayed
- **THEN** the top nav and side nav render identically to all other pages
