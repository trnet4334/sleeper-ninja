### Requirement: System initiates Yahoo OAuth via redirect
The system SHALL redirect the browser to Yahoo's authorization page when the user navigates to `/api/yahoo/connect`.

#### Scenario: Connect redirects to Yahoo
- **WHEN** a user navigates to `/api/yahoo/connect`
- **THEN** the server responds with HTTP 302 and `Location` pointing to Yahoo's OAuth authorization URL with `client_id`, `redirect_uri`, `response_type=code`, `scope=fspt-r`, and a `state` parameter

#### Scenario: Connect fails when env vars missing
- **WHEN** `YAHOO_CLIENT_ID` or `YAHOO_CLIENT_SECRET` is not set
- **THEN** the server responds with HTTP 500 and `{ status: "missing_config" }`

### Requirement: System stores Yahoo token as encrypted httpOnly cookie
The system SHALL exchange the authorization code for tokens and store them encrypted in a browser `httpOnly` cookie after OAuth callback.

#### Scenario: Successful callback sets cookie and redirects
- **WHEN** Yahoo redirects to `/api/yahoo/callback` with a valid `code` parameter
- **THEN** the server exchanges the code for access and refresh tokens
- **AND** encrypts the token payload using AES-256-GCM with the `COOKIE_SECRET` key
- **AND** sets a `yahoo_token` cookie with `httpOnly=true`, `secure=true`, `sameSite=lax`, `maxAge=2592000` (30 days), `path=/`
- **AND** redirects the browser to `/?connected=true`

#### Scenario: Callback with missing code returns 400
- **WHEN** the callback URL contains no `code` parameter
- **THEN** the server responds with HTTP 400 and `{ status: "missing_code" }`

### Requirement: System refreshes the Yahoo token transparently
The system SHALL refresh an expired Yahoo access token and update the cookie without requiring user interaction.

#### Scenario: Expired token is refreshed
- **WHEN** a Yahoo API route reads the cookie and finds the access token is expired
- **THEN** the route calls the Yahoo token refresh endpoint using the stored refresh token
- **AND** encrypts the new tokens and updates the `yahoo_token` cookie in the response
- **AND** proceeds with the original request using the new access token

#### Scenario: Token refresh fails
- **WHEN** the refresh token is invalid or expired
- **THEN** the server responds with HTTP 401 and `{ status: "unauthorized" }`
- **AND** clears the `yahoo_token` cookie

### Requirement: System reports Yahoo connection status
The system SHALL expose an endpoint that reports whether a valid Yahoo token cookie is present.

#### Scenario: Status returns connected when cookie present
- **WHEN** `GET /api/yahoo/status` is called with a valid `yahoo_token` cookie
- **THEN** the server responds with `{ connected: true }`

#### Scenario: Status returns disconnected when cookie absent
- **WHEN** `GET /api/yahoo/status` is called with no `yahoo_token` cookie
- **THEN** the server responds with `{ connected: false }`

### Requirement: System allows users to disconnect Yahoo
The system SHALL clear the Yahoo token cookie when the user disconnects.

#### Scenario: Disconnect clears cookie
- **WHEN** `POST /api/yahoo/disconnect` is called
- **THEN** the server clears the `yahoo_token` cookie by setting `maxAge=0`
- **AND** responds with `{ status: "disconnected" }`
