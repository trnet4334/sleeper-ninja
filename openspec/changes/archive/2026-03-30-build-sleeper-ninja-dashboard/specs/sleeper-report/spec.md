## ADDED Requirements

### Requirement: System surfaces undervalued free agents
The system SHALL rank available players using expected-performance and Statcast-derived deltas so users can identify undervalued waiver options.

#### Scenario: Hitter sleeper list is generated
- **WHEN** a user opens the FA Sleeper Report in hitter mode
- **THEN** the system displays available hitters with actual and expected performance signals
- **AND** sorts the default ranking by the configured undervaluation delta

#### Scenario: Pitcher sleeper list is generated
- **WHEN** a user opens the FA Sleeper Report in pitcher mode
- **THEN** the system displays available pitchers with actual and expected performance signals
- **AND** sorts the default ranking by the configured undervaluation delta

### Requirement: Sleeper report is league-aware
The system SHALL tailor displayed category tags and player recommendation framing to the active league's scoring categories.

#### Scenario: User changes active league
- **WHEN** a user switches the selected league
- **THEN** the sleeper report updates its category framing and recommendation context to match that league's configuration

### Requirement: Sleeper report supports interactive filtering and drill-down
The system SHALL support filtering by player type and time window, sorting by displayed metrics, and viewing player-level detail from the report.

#### Scenario: User changes time window
- **WHEN** a user selects a different time window in the sleeper report
- **THEN** the report recalculates and redisplays the ranking for that selected window

#### Scenario: User opens player detail
- **WHEN** a user selects a player from the sleeper report
- **THEN** the system shows deeper trend and context details for that player
