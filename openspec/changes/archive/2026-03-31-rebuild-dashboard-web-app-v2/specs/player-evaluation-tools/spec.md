## MODIFIED Requirements

### Requirement: System analyzes proposed trades by league categories
The system SHALL compare players being sent and received and report category-level impact for the active league using the current CategoryContext.

#### Scenario: User submits a trade comparison
- **WHEN** a user selects outgoing and incoming players and runs trade analysis
- **THEN** the system displays category-level gains and losses for the active league
- **AND** provides an overall trade assessment summary

#### Scenario: Trade page matches approved shell language
- **WHEN** a user opens the Trade Analyzer page
- **THEN** the system presents the page using the shared prototype-aligned shell, typography, and module hierarchy

### Requirement: System supports player-level Statcast exploration
The system SHALL let users search for a player and inspect detailed metrics, trends, and league-relative context through a web-based exploration workflow.

#### Scenario: User opens a player profile
- **WHEN** a user searches for a player in Stat Explorer and selects a result
- **THEN** the system displays detailed Statcast metrics, recent trend charts, and league-relative comparison context

#### Scenario: Explorer page preserves prototype visual system
- **WHEN** a user opens Stat Explorer
- **THEN** the system renders the explorer within the shared editorial shell and prototype-aligned visual language

### Requirement: Stat Explorer supports side-by-side comparison
The system SHALL allow users to compare more than one player within the explorer workflow.

#### Scenario: User adds a comparison player
- **WHEN** a user adds a second player in the Stat Explorer
- **THEN** the system displays comparative metrics for both players in the same analysis view
