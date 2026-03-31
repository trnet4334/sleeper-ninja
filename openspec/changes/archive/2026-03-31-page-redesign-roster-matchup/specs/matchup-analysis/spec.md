## ADDED Requirements

### Requirement: Win-probability ring
The page SHALL display a circular SVG arc showing the projected win probability (0–100%) for the current matchup. The arc fills clockwise in the primary amber color; the remaining arc is the surface-container color. The percentage is displayed as a large number in the center.

#### Scenario: Ring renders with probability value
- **WHEN** `useMatchupAnalysis` returns a `winProbability` value (e.g. 65)
- **THEN** the SVG arc is filled to 65% of the full circle and "65%" is shown in the center

#### Scenario: Ring renders with fallback value
- **WHEN** `useMatchupAnalysis` returns no `winProbability`
- **THEN** the ring shows 50% as a neutral default

### Requirement: Ninja Insight card
The page SHALL display a "Ninja Insight" card containing a short strategic text summary (1–3 sentences) that contextualizes the matchup. The card uses `surface-container-low` background with an amber accent border or label.

#### Scenario: Insight card renders
- **WHEN** the matchup page loads
- **THEN** a card labeled "Ninja Insight" is visible with non-empty text

#### Scenario: Insight card uses placeholder when no data
- **WHEN** `useMatchupAnalysis` returns no insight text
- **THEN** the card shows a placeholder message such as "Analyzing matchup…"

### Requirement: Category comparison grid
The page SHALL display a grid of scoring categories, one row per category. Each row shows: the category name, a WIN/LOSS/TOSS badge (colored green/red/amber respectively), my projected value, and the opponent's projected value.

#### Scenario: WIN badge shown
- **WHEN** the user's projected value for a category exceeds the opponent's
- **THEN** a green "WIN" badge is displayed for that category row

#### Scenario: LOSS badge shown
- **WHEN** the opponent's projected value exceeds the user's
- **THEN** a red "LOSS" badge is displayed for that category row

#### Scenario: TOSS badge shown
- **WHEN** projected values for a category are equal or within a negligible margin
- **THEN** an amber "TOSS" badge is displayed for that category row

#### Scenario: Grid includes all active scoring categories
- **WHEN** the matchup page loads
- **THEN** every category from `useCategories()` appears as a row in the grid

### Requirement: Side-by-side roster columns
The page SHALL display two columns — "My Roster" and "Opponent's Roster" — each listing the players on each side with their name, team, and live game status indicator.

#### Scenario: My roster column populated
- **WHEN** matchup data includes my roster
- **THEN** my players appear in the left column with name and team

#### Scenario: Opponent roster column populated
- **WHEN** matchup data includes the opponent's roster
- **THEN** opponent players appear in the right column with name and team

#### Scenario: Columns visible on mobile
- **WHEN** the page is viewed on a narrow viewport
- **THEN** the two columns stack vertically (flex-col) rather than overflow

### Requirement: Matchup opponent header
The page SHALL display the opponent's team name in a large heading above the main content (e.g., "H2H Performance vs. The Grinder Society").

#### Scenario: Opponent name shown
- **WHEN** matchup data includes opponent team name
- **THEN** the heading reads "H2H Performance vs. <opponent name>"

#### Scenario: Opponent name fallback
- **WHEN** no opponent name is available
- **THEN** the heading reads "H2H Matchup Analysis"

### Requirement: AppShell unchanged
The redesign SHALL NOT modify AppShell, the top navigation bar, or the side navigation bar.

#### Scenario: Navigation remains intact
- **WHEN** the H2H Matchup page is displayed
- **THEN** the top nav and side nav render identically to all other pages
