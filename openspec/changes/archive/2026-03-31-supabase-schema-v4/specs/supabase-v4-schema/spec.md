## ADDED Requirements

### Requirement: Supabase stores batter Statcast metrics per time window
The system SHALL maintain a `statcast_batters` table with one row per `(player_id, days_back)` combination, holding xStats and Statcast signals for hitters.

#### Scenario: Batter row upserted with 14-day window data
- **WHEN** the ingestion script runs for hitters with `days_back=14`
- **THEN** the `statcast_batters` table contains a row for each batter with `days_back=14`
- **AND** the row includes `xba`, `xslg`, `xwoba`, `barrel_pct`, `hard_hit_pct`, `ev_avg`, `sprint_speed` where available

#### Scenario: Upsert replaces existing row for same player and window
- **WHEN** the ingestion script runs again for the same `(player_id, days_back)`
- **THEN** the existing row is updated in place, not duplicated

### Requirement: Supabase stores pitcher Statcast metrics per time window
The system SHALL maintain a `statcast_pitchers` table with one row per `(player_id, days_back)` combination, holding xStats and Statcast signals for pitchers.

#### Scenario: Pitcher row upserted with 14-day window data
- **WHEN** the ingestion script runs for pitchers with `days_back=14`
- **THEN** the `statcast_pitchers` table contains a row for each pitcher with `days_back=14`
- **AND** the row includes `xera`, `xfip`, `xwoba_against`, `swstr_pct`, `csw_pct`, `k_pct`, `bb_pct` where available

### Requirement: Supabase stores full-season Steamer projections
The system SHALL maintain a `projections` table with one row per player per season holding full Steamer projection values.

#### Scenario: Projection row upserted for a season
- **WHEN** the ingestion script runs projections for season 2025
- **THEN** the `projections` table contains one row per player with all hitting or pitching projection columns

### Requirement: Supabase stores ADP rankings
The system SHALL maintain an `adp` table with one row per player holding the current average draft position.

#### Scenario: ADP row upserted
- **WHEN** the ingestion script runs ADP data
- **THEN** the `adp` table contains one row per player with `adp` value and `position`

### Requirement: Supabase stores active injury events
The system SHALL maintain an `injuries` table with one row per `(player_id, date)` holding IL placement records.

#### Scenario: IL placement recorded
- **WHEN** the ingestion script encounters a new IL entry for a player
- **THEN** an `injuries` row is inserted with the player's `il_type`, `date`, and `description`

#### Scenario: Duplicate IL event not inserted
- **WHEN** the same `(player_id, date)` already exists in `injuries`
- **THEN** the row is updated in place (upsert), not duplicated

### Requirement: API reads Statcast data from typed source tables
The system SHALL query `statcast_batters` or `statcast_pitchers` based on the requested `playerType`, replacing the flat `players` table query.

#### Scenario: Hitter query reads from statcast_batters
- **WHEN** `queryPlayersFromDb` is called with `playerType="hitter"` and `daysBack=14`
- **THEN** the system queries `statcast_batters` with `WHERE days_back = 14`
- **AND** maps batter-specific column names to display metric keys

#### Scenario: Pitcher query reads from statcast_pitchers
- **WHEN** `queryPlayersFromDb` is called with `playerType="pitcher"` and `daysBack=14`
- **THEN** the system queries `statcast_pitchers` with `WHERE days_back = 14`
- **AND** maps pitcher-specific column names to display metric keys
