## MODIFIED Requirements

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

### Requirement: System supports source-scoped refreshes
The system SHALL allow refresh workflows to run for all sources or for an individual source such as Savant, projections, ADP, or injuries.

#### Scenario: User refreshes only Savant data
- **WHEN** a maintainer invokes the refresh workflow for the Savant source only
- **THEN** the system refreshes only the Savant-related Supabase data
- **AND** leaves unrelated sources unchanged

### Requirement: System provides shared stat mapping definitions for category-driven analysis
The system SHALL maintain a reusable category-to-analysis-metric mapping layer that frontend settings workflows and backend analysis routes can both use when interpreting league scoring categories.

#### Scenario: Custom league categories are evaluated
- **WHEN** a page or API route needs related analysis metrics for a selected category
- **THEN** the system resolves that category through the shared stat mapping definitions
- **AND** uses league-specific overrides when they exist

### Requirement: Scheduler can run unattended refreshes
The system SHALL support unattended daily refresh execution through GitHub Actions using configured schedule and environment secrets.

#### Scenario: Daily scheduled refresh time is reached
- **WHEN** the GitHub Actions cron schedule reaches the configured daily refresh time
- **THEN** the system runs the refresh workflow in the background
- **AND** updates Supabase with the latest enabled baseball data sources
