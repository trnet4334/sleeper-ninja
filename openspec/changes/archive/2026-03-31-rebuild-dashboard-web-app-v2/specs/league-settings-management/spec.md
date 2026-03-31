## ADDED Requirements

### Requirement: System manages league definitions in local storage
The system SHALL allow the user to create, edit, select, and remove league definitions in browser localStorage, including display name, Yahoo league ID, and season metadata.

#### Scenario: User adds a new league
- **WHEN** a user opens League Manager and saves a new league definition
- **THEN** the system stores the league in localStorage
- **AND** makes the new league available in the league tab bar without reloading the app

#### Scenario: User removes a league
- **WHEN** a user confirms deletion of an existing league
- **THEN** the system removes that league definition from localStorage
- **AND** updates the visible league tab list immediately

### Requirement: System manages category mappings per league
The system SHALL allow the user to create, remove, and override hitter and pitcher categories for each league, including mapping each category to related Statcast analysis metrics.

#### Scenario: User adds a custom category
- **WHEN** a user adds a new category in Category Manager for a league
- **THEN** the system stores the category and its related metrics in localStorage
- **AND** updates CategoryContext for that league immediately

#### Scenario: User overrides category-to-stat mapping
- **WHEN** a user manually changes which analysis metrics are associated with a category
- **THEN** the system persists the override for that league
- **AND** downstream pages use the overridden mapping on the next render

### Requirement: System manages stat preferences per league
The system SHALL allow the user to configure per-league advanced stat preferences, including which derived metrics to display and the active historical lookback window.

#### Scenario: User updates advanced stat preferences
- **WHEN** a user enables or disables advanced stats in Stat Preferences
- **THEN** the system stores the selected stats for that league in localStorage
- **AND** CategoryContext exposes the updated stat preference list

#### Scenario: User changes lookback window
- **WHEN** a user changes the active days-back preference for a league
- **THEN** the system persists the selected value in localStorage
- **AND** subsequent page fetches use that updated lookback window
