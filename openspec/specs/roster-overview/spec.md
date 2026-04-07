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

### Requirement: Page auto-imports Yahoo leagues when connected and no leagues exist
The page SHALL detect when Yahoo OAuth is connected and no leagues exist in localStorage, then automatically fetch and import the user's Yahoo leagues without requiring manual entry via the Add League form.

#### Scenario: Auto-import on first visit after Yahoo connect
- **WHEN** the My Roster page mounts with Yahoo connected and `leagues.length === 0`
- **THEN** the system fetches leagues from `/api/yahoo/leagues`, adds each result via `addLeague`, and renders the roster content for the first imported league

#### Scenario: Loading state during auto-import
- **WHEN** the auto-import fetch is in progress
- **THEN** the page shows a loading skeleton or spinner instead of the Add League form

#### Scenario: No leagues found on Yahoo account
- **WHEN** Yahoo is connected but `/api/yahoo/leagues` returns an empty array
- **THEN** the Add League form is shown so the user can add a league manually

#### Scenario: Yahoo not connected — form shown as before
- **WHEN** Yahoo is not connected and `leagues.length === 0`
- **THEN** the Add League form is shown (no auto-import attempted)

### Requirement: Roster content uses Yahoo roster data when active league has a Yahoo league ID
The page SHALL use `useYahooRoster` to populate the hitter and pitcher tables when the active league has a non-empty `yahooLeagueId`, replacing the static `useRosterData` hook.

#### Scenario: Yahoo-backed league shows real roster
- **WHEN** the active league has a `yahooLeagueId` and the user navigates to My Roster
- **THEN** the hitter and pitcher tables are populated with players returned from `useYahooRoster`

#### Scenario: No yahooLeagueId — tables show empty state
- **WHEN** the active league has an empty `yahooLeagueId`
- **THEN** the tables show the empty-state message ("No players on roster.")

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the My Roster page is displayed
- **THEN** the top nav and side nav render identically to all other pages
