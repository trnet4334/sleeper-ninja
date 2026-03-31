### Requirement: API handlers query Supabase players table
The `/api/data/players`, `/api/data/analysis`, and `/api/data/matchup` handlers SHALL query the Supabase `players` table when `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are available in the environment, returning real player data filtered by `playerType` and enriched with only the requested metrics.

#### Scenario: Players endpoint returns Supabase data when configured
- **WHEN** Supabase is configured and the `players` table has rows
- **THEN** `GET /api/data/players?playerType=hitter` returns players from Supabase, not from the hardcoded `samplePlayers` array

#### Scenario: Analysis endpoint returns real summary metrics
- **WHEN** Supabase is configured and has player rows
- **THEN** `GET /api/data/analysis` returns `availableFas`, `topDelta`, and `hotPlayers` computed from real Supabase data

### Requirement: API falls back to mock data when Supabase is unconfigured
When `SUPABASE_URL` or `SUPABASE_SERVICE_KEY` is missing, all three API handlers SHALL fall back to the existing `samplePlayers` mock data and return a valid response. The fallback SHALL NOT throw an error.

#### Scenario: Graceful fallback without credentials
- **WHEN** `SUPABASE_URL` is not set in the environment
- **THEN** `GET /api/data/players` returns a 200 response with mock player data
- **THEN** the response shape is identical to the live-data response

### Requirement: Supabase player records map to the existing API response shape
Player records returned from Supabase SHALL be mapped to the same shape as `SamplePlayer` in `api/_shared/data.ts`: `{ id, playerName, team, position, playerType, rosterState, metrics, trend, delta, recommendationScore }`. All stat column names (snake_case in DB) SHALL be mapped to their display keys (e.g., `barrel_pct` → `"Barrel%"`, `hard_hit_pct` → `"HardHit%"`).

#### Scenario: Metric key names match what the UI expects
- **WHEN** a player row is fetched from Supabase and mapped
- **THEN** the `metrics` object contains keys like `"AVG"`, `"Barrel%"`, `"HardHit%"`, `"xwOBA"` — not `"avg"`, `"barrel_pct"`, etc.
