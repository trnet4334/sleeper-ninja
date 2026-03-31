## MODIFIED Requirements

### Requirement: System authenticates with Yahoo Fantasy APIs
The system SHALL provide a Yahoo OAuth flow that stores the token in an encrypted browser cookie and supports transparent token refresh for subsequent API calls without a user account system.

#### Scenario: First-time Yahoo connect succeeds
- **WHEN** a user navigates to `/api/yahoo/connect` and completes Yahoo consent
- **THEN** the system stores the resulting access and refresh tokens encrypted in a `yahoo_token` httpOnly cookie
- **AND** redirects the user back to the Dashboard
- **AND** enables future Yahoo API calls without repeating the flow for 30 days

#### Scenario: Expired token is refreshed
- **WHEN** the system attempts a Yahoo API call and the cookie token is expired
- **THEN** the system refreshes the token using the stored refresh token
- **AND** updates the cookie with the new token before completing the request

### Requirement: System syncs roster and waiver context for configured leagues
The system SHALL load the user's roster and relevant free-agent context for each configured Yahoo league using the cookie token — no `user_id` parameter is required.

#### Scenario: Dashboard loads league roster data
- **WHEN** a user opens a dashboard page for a configured league
- **THEN** the system reads the `yahoo_token` cookie to authenticate
- **AND** provides the current roster data for that league
- **AND** makes waiver or free-agent context available to recommendation features

#### Scenario: Roster request without cookie returns 401
- **WHEN** `/api/yahoo/roster` is called with no `yahoo_token` cookie
- **THEN** the server responds with HTTP 401 and `{ status: "unauthorized" }`

### Requirement: System syncs current matchup context
The system SHALL retrieve the active head-to-head opponent and matchup context using the cookie token — no `user_id` parameter is required.

#### Scenario: Matchup page loads current opponent
- **WHEN** a user opens the H2H matchup page for a configured league
- **THEN** the system reads the `yahoo_token` cookie to authenticate
- **AND** shows the current opponent and matchup context for the active scoring period

### Requirement: System retrieves recent transactions for a league
The system SHALL return recent waiver and trade transactions for a configured league using the cookie token.

#### Scenario: Transactions returned for valid league
- **WHEN** `GET /api/yahoo/transactions?league_id=<id>` is called with a valid cookie
- **THEN** the server returns a list of recent transactions for that league

#### Scenario: Transactions request without cookie returns 401
- **WHEN** `/api/yahoo/transactions` is called with no `yahoo_token` cookie
- **THEN** the server responds with HTTP 401 and `{ status: "unauthorized" }`

## REMOVED Requirements

### Requirement: System authenticates with Yahoo Fantasy APIs (legacy token store)
**Reason**: Replaced by cookie-based auth — no server-side token persistence
**Migration**: Remove `yahoo_tokens` Supabase table; all token state lives in the browser `yahoo_token` cookie
