### Requirement: Search input
The page SHALL display a full-width search input at the top that filters the displayed player list by player name (client-side, case-insensitive). The input SHALL include a search icon on the left.

#### Scenario: Search filters players
- **WHEN** the user types text into the search input
- **THEN** only players whose name contains the search string (case-insensitive) are shown in the table and breakout cards

#### Scenario: Empty search shows all players
- **WHEN** the search input is empty
- **THEN** all players are shown

### Requirement: Role tabs
The page SHALL display three role filter tabs below the search bar: "Hitter", "SP", "Closer". The active tab SHALL have a primary amber underline. Selecting a tab filters the player list by role.

#### Scenario: Hitter tab active by default
- **WHEN** the Stat Explorer page loads
- **THEN** the "Hitter" tab is active and only hitter-type players are displayed

#### Scenario: SP tab filters pitchers
- **WHEN** the user clicks the "SP" tab
- **THEN** only starting pitchers are shown in the table and breakout cards

#### Scenario: Closer tab filters closers
- **WHEN** the user clicks the "Closer" tab
- **THEN** only relief/closer pitchers are shown

### Requirement: Breakout Alerts scroll row
The page SHALL display a "Breakout Alerts" section with a horizontal snap-scroll row of player cards, and chevron left/right buttons in the section header that scroll the row by ~340px. Each card SHALL show: a round initials avatar (amber background), two key metric values in a 2-column mini-grid below the avatar, player name, position/team sub-label, and a short insight description. Cards SHALL be `w-[340px]` fixed-width with `flex-none` and include a `hover:border-primary/30` hover effect.

#### Scenario: Breakout cards render
- **WHEN** the Stat Explorer page loads with players available
- **THEN** at least one breakout card is visible in the horizontal scroll row

#### Scenario: Breakout cards are sorted by recommendationScore
- **WHEN** breakout cards are displayed
- **THEN** the player with the highest `recommendationScore` appears first (leftmost)

### Requirement: Detailed Analytics table
The page SHALL display a "Detailed Analytics" table with columns: Player (initials avatar + name + position sub-label), Team, AVG, HR, RBI, xwOBA, SB, Trend badge. The table SHALL be paginated at 10 rows per page with PREV/NEXT buttons. Trend badge SHALL use a 5-tier system: `recommendationScore ≥ 90 → ELITE` (tertiary/gold), `≥ 75 → MVP` (tertiary/gold), `≥ 60 → SPEED` (primary/amber), then delta-based `HOT` (amber, delta > 0.5), `COLD` (error, delta < -0.5), `STEADY` (secondary).

#### Scenario: Table rows render from filtered player list
- **WHEN** a role tab is active and players are available
- **THEN** each player appears as a table row with name, team, and numeric stat values in the appropriate columns

#### Scenario: HOT badge shown for positive delta
- **WHEN** a player has `delta > 0.5`
- **THEN** the Trend column shows an amber "HOT" badge

#### Scenario: COLD badge shown for negative delta
- **WHEN** a player has `delta < -0.5`
- **THEN** the Trend column shows an error-tone "COLD" badge

#### Scenario: Pagination controls visible
- **WHEN** more than 10 players match the current filter
- **THEN** PREV and NEXT buttons are shown below the table

#### Scenario: PREV disabled on first page
- **WHEN** the user is on page 1
- **THEN** the PREV button is visually disabled (reduced opacity)

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the Stat Explorer page is displayed
- **THEN** the top nav and side nav render identically to all other pages
