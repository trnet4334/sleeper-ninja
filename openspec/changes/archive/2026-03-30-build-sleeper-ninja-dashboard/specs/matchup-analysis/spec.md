## ADDED Requirements

### Requirement: System forecasts category matchup outcomes
The system SHALL compare the user's active roster context with the current opponent to estimate category-level head-to-head outcomes.

#### Scenario: Matchup grid is rendered
- **WHEN** a user opens the H2H Matchup page
- **THEN** the system displays each active category with projected user value, projected opponent value, and a forecast state

### Requirement: Matchup analysis supports confidence modes
The system SHALL allow the user to switch among conservative, average, and optimistic forecast modes.

#### Scenario: User changes forecast mode
- **WHEN** a user selects a different forecast mode
- **THEN** the matchup view recalculates and redisplays projections using that mode

### Requirement: System recommends free agents for weak categories
The system SHALL identify projected weak categories and recommend relevant available players who can improve those categories.

#### Scenario: Projected losing category exists
- **WHEN** the system forecasts that the user is behind in a category
- **THEN** the matchup page shows one or more available-player suggestions targeted at improving that category
