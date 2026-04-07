## MODIFIED Requirements

### Requirement: System syncs roster and waiver context for configured leagues
The system SHALL load the authenticated user's actual team roster from Yahoo Fantasy API for the league specified by `league_id`, returning each rostered player's name, MLB team abbreviation, primary position, selected fantasy position, and injury status. The stub placeholder data SHALL be replaced.

#### Scenario: Dashboard loads league roster data
- **WHEN** a user opens My Roster for a configured Yahoo-backed league
- **THEN** the system provides the current real Yahoo roster for that league through `/api/yahoo/roster`
- **AND** players are split into hitters and pitchers based on primary position

#### Scenario: Roster endpoint rejects missing league ID
- **WHEN** `GET /api/yahoo/roster` is called without a `league_id` parameter
- **THEN** the endpoint returns HTTP 400 with `{ status: "missing_league_id" }`
