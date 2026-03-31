## ADDED Requirements

### Requirement: System authenticates with Yahoo Fantasy APIs
The system SHALL provide a Yahoo OAuth flow that stores credentials locally and supports token refresh for subsequent sync operations.

#### Scenario: First-time Yahoo setup succeeds
- **WHEN** a user runs the Yahoo auth setup flow and completes consent
- **THEN** the system stores the resulting credentials in local environment-backed configuration
- **AND** enables future Yahoo API calls without repeating the full setup flow

#### Scenario: Expired token is refreshed
- **WHEN** the system attempts a Yahoo sync with an expired access token and a valid refresh path exists
- **THEN** the system refreshes the token before retrying the API request

### Requirement: System syncs roster and waiver context for configured leagues
The system SHALL load the user's roster and relevant free-agent or waiver context for each configured Yahoo league.

#### Scenario: Dashboard loads league roster data
- **WHEN** a user opens a dashboard page for a configured league
- **THEN** the system provides the current roster data for that league
- **AND** makes waiver or free-agent context available to recommendation features

### Requirement: System syncs current matchup context
The system SHALL retrieve the active head-to-head opponent and matchup-relevant Yahoo context for the selected league.

#### Scenario: Matchup page loads current opponent
- **WHEN** a user opens the head-to-head matchup page for a configured league
- **THEN** the system shows the current opponent and matchup context for the active scoring period
