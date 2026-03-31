## ADDED Requirements

### Requirement: System ingests and caches external baseball data
The system SHALL fetch Baseball Savant or Statcast data, MLB injury data, and other required baseball reference data into local cache artifacts so downstream analysis can run without re-querying every source on each page load.

#### Scenario: Initial refresh populates cache
- **WHEN** a user runs the refresh workflow with no warm cache present
- **THEN** the system fetches the configured baseball data sources
- **AND** writes normalized cache artifacts to the local cache directory

#### Scenario: Cached data is reused while valid
- **WHEN** a dashboard page requests data and an unexpired cache artifact exists
- **THEN** the system uses the cached artifact instead of re-fetching the source

### Requirement: System supports source-scoped refreshes
The system SHALL allow refresh workflows to run for all sources or for an individual source such as Savant or Yahoo sync.

#### Scenario: User refreshes only Savant data
- **WHEN** a user invokes the refresh script for the Savant source only
- **THEN** the system refreshes only the Savant-related cache artifacts
- **AND** leaves unrelated cached sources unchanged

### Requirement: League configuration drives analysis mappings
The system SHALL load league definitions and category-to-metric mappings from configuration files rather than hardcoded values.

#### Scenario: User adds a league configuration
- **WHEN** a new league is added to the configured leagues file with hitter and pitcher categories
- **THEN** the system makes that league available to downstream dashboard analysis without source code changes

### Requirement: Scheduler can run unattended refreshes
The system SHALL support scheduled refresh execution based on configured time and timezone values.

#### Scenario: Daily scheduled refresh time is reached
- **WHEN** the scheduler reaches the configured daily refresh time in the configured timezone
- **THEN** the system runs the refresh workflow in the background
- **AND** updates the cached data artifacts for the enabled sources
