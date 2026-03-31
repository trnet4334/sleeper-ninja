## MODIFIED Requirements

### Requirement: System ingests and caches external baseball data
The system SHALL fetch Baseball Savant / Statcast data, Steamer projections, ADP, and MLB injury data and write them into Supabase typed source tables (`statcast_batters`, `statcast_pitchers`, `projections`, `adp`, `injuries`) so downstream API routes can query without re-fetching external sources on each request.

#### Scenario: Initial refresh populates split Statcast tables
- **WHEN** a user runs `python scripts/fetch_all.py` with no prior data
- **THEN** the system fetches Statcast data for hitters and pitchers separately
- **AND** writes normalized rows to `statcast_batters` and `statcast_pitchers` with the configured `days_back` value
- **AND** upserts ADP into `adp`, projections into `projections`, and injuries into `injuries`

#### Scenario: Subsequent refresh updates existing rows in place
- **WHEN** the ingestion script runs again for the same `(player_id, days_back)`
- **THEN** existing rows in `statcast_batters` and `statcast_pitchers` are updated, not duplicated

### Requirement: System supports source-scoped refreshes
The system SHALL allow refresh workflows to target `batters`, `pitchers`, `projections`, `adp`, or `injuries` independently.

#### Scenario: User refreshes only batter Statcast data
- **WHEN** a user invokes `python scripts/fetch_all.py --source savant --type hitter`
- **THEN** the system refreshes only `statcast_batters`
- **AND** leaves `statcast_pitchers`, `projections`, `adp`, and `injuries` unchanged

### Requirement: League configuration drives analysis mappings
The system SHALL load league definitions and category-to-metric mappings from configuration files rather than hardcoded values.

#### Scenario: User adds a league configuration
- **WHEN** a new league is added to the configured leagues file with hitter and pitcher categories
- **THEN** the system makes that league available to downstream dashboard analysis without source code changes

### Requirement: Scheduler can run unattended refreshes
The system SHALL support scheduled refresh execution via GitHub Actions cron (`0 23 * * *` UTC = 07:00 CST) writing to Supabase.

#### Scenario: Daily scheduled refresh time is reached
- **WHEN** the GitHub Actions cron job triggers at UTC 23:00
- **THEN** the system runs `fetch_all.py` and updates all Supabase source tables
- **AND** subsequent API queries reflect the freshened data
