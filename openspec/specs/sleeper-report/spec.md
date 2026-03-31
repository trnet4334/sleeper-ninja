# sleeper-report Specification

## Purpose
TBD - created by archiving change build-sleeper-ninja-dashboard. Update Purpose after archive.
## Requirements
### Requirement: System surfaces undervalued free agents
The system SHALL rank available players using expected-performance and Statcast-derived deltas so users can identify undervalued waiver options through a league-aware web report that preserves the approved prototype's editorial analytics layout.

#### Scenario: Hitter sleeper list is generated
- **WHEN** a user opens the FA Sleeper Report in hitter mode
- **THEN** the system displays available hitters with actual and expected performance signals
- **AND** sorts the default ranking by the configured undervaluation delta

#### Scenario: Pitcher sleeper list is generated
- **WHEN** a user opens the FA Sleeper Report in pitcher mode
- **THEN** the system displays available pitchers with actual and expected performance signals
- **AND** sorts the default ranking by the configured undervaluation delta

### Requirement: Sleeper report is league-aware
The system SHALL tailor category filters, displayed columns, and recommendation framing to the active league's CategoryContext, including league-specific categories and stat preferences.

#### Scenario: User changes active league
- **WHEN** a user switches the selected league
- **THEN** the sleeper report updates its category framing and recommendation context to match that league's configuration
- **AND** refetches data using the new CategoryContext parameters

### Requirement: Sleeper report supports interactive filtering and drill-down
The system SHALL support filtering by player type and time window, sorting by displayed metrics, and viewing player-level detail from the report through a web table and drawer workflow.

#### Scenario: User changes time window
- **WHEN** a user selects a different time window in the sleeper report
- **THEN** the report recalculates and redisplays the ranking for that selected window

#### Scenario: User opens player detail
- **WHEN** a user selects a player from the sleeper report
- **THEN** the system shows deeper trend and context details for that player in a detail drawer or equivalent drill-down surface

#### Scenario: Sleeper page follows approved module hierarchy
- **WHEN** a user opens the sleeper report
- **THEN** the system presents the page using the prototype-defined header, metric overview, filter controls, and ranked candidate module order
