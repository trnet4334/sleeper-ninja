### Requirement: Dashboard shows connect prompt when Yahoo is not linked
The system SHALL display a visible banner prompting the user to connect their Yahoo account when no valid token cookie is detected.

#### Scenario: Banner shown when not connected
- **WHEN** the dashboard loads and `/api/yahoo/status` returns `{ connected: false }`
- **THEN** a `YahooConnectBanner` component is rendered at the top of the page
- **AND** the banner contains a link or button that navigates to `/api/yahoo/connect`

#### Scenario: Banner hidden when connected
- **WHEN** the dashboard loads and `/api/yahoo/status` returns `{ connected: true }`
- **THEN** no connect banner is rendered

### Requirement: Frontend hook detects Yahoo auth state
The system SHALL provide a `useYahooAuth` React hook that encapsulates the `/api/yahoo/status` check and returns a loading/connected state.

#### Scenario: Hook returns connected state
- **WHEN** `useYahooAuth()` is called and the status endpoint responds `{ connected: true }`
- **THEN** the hook returns `{ connected: true, loading: false }`

#### Scenario: Hook returns disconnected state
- **WHEN** `useYahooAuth()` is called and the status endpoint responds `{ connected: false }`
- **THEN** the hook returns `{ connected: false, loading: false }`

#### Scenario: Hook returns loading during fetch
- **WHEN** `useYahooAuth()` is called and the status fetch is in-flight
- **THEN** the hook returns `{ connected: false, loading: true }`
