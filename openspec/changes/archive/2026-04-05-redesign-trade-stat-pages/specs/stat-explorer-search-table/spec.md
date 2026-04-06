## ADDED Requirements

### Requirement: Breakout Alerts scroll navigation arrows
The Breakout Alerts section SHALL display chevron left and right buttons next to the section title. Clicking left/right SHALL smoothly scroll the card row by approximately 340px in the respective direction.

#### Scenario: Right arrow scrolls the row
- **WHEN** the user clicks the right chevron button in the Breakout Alerts header
- **THEN** the horizontal scroll container scrolls right by ~340px with smooth behaviour

#### Scenario: Left arrow scrolls the row
- **WHEN** the user clicks the left chevron button
- **THEN** the horizontal scroll container scrolls left by ~340px with smooth behaviour

### Requirement: Breakout card redesign with initials avatar and 2-stat mini-grid
Each BreakoutCard SHALL display: a round initials avatar (first + last initial, amber background), a 2×1 mini-grid below the avatar showing two key metrics (labels and values), the player name, position/team sub-label, and a short description text. The card SHALL be `w-72` fixed width with `flex-none` and include a hover effect (`hover:border-primary/30`).

#### Scenario: Breakout card shows initials avatar
- **WHEN** a breakout card renders
- **THEN** a round element containing the player's initials (2 characters) is visible in place of a headshot image

#### Scenario: Breakout card shows two key stats
- **WHEN** a breakout card renders
- **THEN** two labelled metric values are displayed in a 2-column grid below the avatar

### Requirement: Enhanced trend labels (ELITE / MVP / SPEED)
The Detailed Analytics table Trend column SHALL use a 5-tier label: `recommendationScore ≥ 90 → ELITE` (tertiary/gold tone), `recommendationScore ≥ 75 → MVP` (tertiary/gold tone), `recommendationScore ≥ 60 → SPEED` (primary/amber tone), then fall back to delta-based HOT / STEADY / COLD.

#### Scenario: High-score player gets ELITE label
- **WHEN** a player row has `recommendationScore >= 90`
- **THEN** the Trend cell shows an "ELITE" badge in a tertiary (gold) colour scheme

#### Scenario: Mid-score player gets SPEED label
- **WHEN** a player row has `recommendationScore >= 60 and < 75`
- **THEN** the Trend cell shows a "SPEED" badge in the primary amber colour scheme

#### Scenario: Low-score player falls back to delta-based label
- **WHEN** a player row has `recommendationScore < 60`
- **THEN** the Trend cell shows HOT, STEADY, or COLD based on `delta` value thresholds (unchanged)
