# yahoo-fantasy-sync Specification

## Purpose
TBD - created by archiving change build-sleeper-ninja-dashboard. Update Purpose after archive.
## Requirements
### Requirement: System authenticates with Yahoo Fantasy APIs
The system SHALL provide a Yahoo OAuth flow through server-side API routes, store access and refresh tokens in Supabase, and support token refresh for subsequent sync operations.

#### Scenario: First-time Yahoo setup succeeds
- **WHEN** a user starts Yahoo connection from the dashboard and completes consent
- **THEN** the system stores the resulting credentials in Supabase-backed token storage
- **AND** enables future Yahoo API calls without repeating the full setup flow

#### Scenario: Expired token is refreshed
- **WHEN** the system attempts a Yahoo sync with an expired access token and a valid refresh path exists
- **THEN** the server-side Yahoo integration refreshes the token before retrying the API request

### Requirement: System syncs roster and waiver context for configured leagues
The system SHALL load the authenticated user's actual team roster from Yahoo Fantasy API for the league specified by `league_id`, returning each rostered player's name, MLB team abbreviation, primary position, selected fantasy position, and injury status. The stub placeholder data has been replaced with real Yahoo API calls.

#### Scenario: Dashboard loads league roster data
- **WHEN** a user opens My Roster for a configured Yahoo-backed league
- **THEN** the system provides the current real Yahoo roster for that league through `/api/yahoo/roster`
- **AND** players are split into hitters and pitchers based on primary position

#### Scenario: Roster endpoint rejects missing league ID
- **WHEN** `GET /api/yahoo/roster` is called without a `league_id` parameter
- **THEN** the endpoint returns HTTP 400 with `{ status: "missing_league_id" }`

### Requirement: System syncs current matchup context
The system SHALL retrieve the active head-to-head opponent and matchup-relevant Yahoo context for the selected league through server-side integration routes.

#### Scenario: Matchup page loads current opponent
- **WHEN** a user opens the head-to-head matchup page for a configured league
- **THEN** the system shows the current opponent and matchup context for the active scoring period
- **AND** keeps Yahoo credentials hidden from the client

### Requirement: System retrieves recent transactions for a league
The system SHALL return recent waiver and trade transactions for a configured league using the cookie token.

#### Scenario: Transactions returned for valid league
- **WHEN** `GET /api/yahoo/transactions?league_id=<id>` is called with a valid cookie
- **THEN** the server returns a list of recent transactions for that league

#### Scenario: Transactions request without cookie returns 401
- **WHEN** `/api/yahoo/transactions` is called with no `yahoo_token` cookie
- **THEN** the server responds with HTTP 401 and `{ status: "unauthorized" }`
