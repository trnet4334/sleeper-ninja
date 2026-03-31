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
The system SHALL load the user's roster and relevant free-agent or waiver context for the leagues configured in localStorage by calling Yahoo through authenticated API routes.

#### Scenario: Dashboard loads league roster data
- **WHEN** a user opens a dashboard page for a configured league
- **THEN** the system provides the current roster data for that league through an API route
- **AND** makes waiver or free-agent context available to recommendation features

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
