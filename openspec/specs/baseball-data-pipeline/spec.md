# baseball-data-pipeline Specification

## Purpose
TBD - created by archiving change build-sleeper-ninja-dashboard. Update Purpose after archive.
## Requirements
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
The system SHALL allow refresh workflows to run for all sources or for an individual source such as Savant, projections, ADP, or injuries.

#### Scenario: User refreshes only Savant data
- **WHEN** a maintainer invokes the refresh workflow for the Savant source only
- **THEN** the system refreshes only the Savant-related Supabase data
- **AND** leaves unrelated sources unchanged

### Requirement: League configuration drives analysis mappings
The system SHALL load league definitions and category-to-metric mappings from configuration files rather than hardcoded values.

#### Scenario: User adds a league configuration
- **WHEN** a new league is added to the configured leagues file with hitter and pitcher categories
- **THEN** the system makes that league available to downstream dashboard analysis without source code changes

### Requirement: Scheduler can run unattended refreshes
The system SHALL support unattended daily refresh execution through GitHub Actions using configured schedule and environment secrets.

#### Scenario: Daily scheduled refresh time is reached
- **WHEN** the GitHub Actions cron schedule reaches the configured daily refresh time
- **THEN** the system runs the refresh workflow in the background
- **AND** updates Supabase with the latest enabled baseball data sources

### Requirement: System ingests and stores external baseball data in Supabase
The system SHALL fetch Baseball Savant or Statcast data, MLB injury data, Steamer projections, and other required baseball reference data into Supabase tables so downstream API routes can serve analysis without re-querying upstream sources on each request.

#### Scenario: Daily pipeline run populates warehouse tables
- **WHEN** the scheduled refresh workflow runs with source credentials available
- **THEN** the system fetches the configured baseball data sources
- **AND** writes normalized and queryable data into Supabase tables for downstream API use

#### Scenario: API route reads preloaded data
- **WHEN** a frontend page requests player or analysis data
- **THEN** the system serves the response from Supabase-backed data
- **AND** does not synchronously refetch third-party baseball data as part of that request

### Requirement: System provides shared stat mapping definitions for category-driven analysis
The system SHALL maintain a reusable category-to-analysis-metric mapping layer that frontend settings workflows and backend analysis routes can both use when interpreting league scoring categories.

#### Scenario: Custom league categories are evaluated
- **WHEN** a page or API route needs related analysis metrics for a selected category
- **THEN** the system resolves that category through the shared stat mapping definitions
- **AND** uses league-specific overrides when they exist
