## MODIFIED Requirements

### Requirement: System shows roster health and trend context
The system SHALL display the user's current roster with short-term performance context, injury state, and remaining opportunity indicators in a league-aware card grid that follows the approved prototype design language.

#### Scenario: Roster page loads player cards
- **WHEN** a user opens the My Roster page
- **THEN** the system displays rostered players with role or position, injury state, recent performance context, and remaining schedule opportunity

#### Scenario: Roster page preserves prototype section rhythm
- **WHEN** a user opens the My Roster page
- **THEN** the system renders the page with prototype-aligned heading hierarchy, card rhythm, and action emphasis rather than a generic utility grid

### Requirement: User can mark roster watch status
The system SHALL allow the user to flag rostered players for observation or possible drop consideration and persist those annotations per league in the client-side settings layer.

#### Scenario: User marks player as possible drop
- **WHEN** a user marks a rostered player as a drop candidate
- **THEN** the system stores that watch status for dashboard use
- **AND** preserves the flag for that league across page reloads

### Requirement: Sleeper recommendations reflect drop-watch context
The system SHALL use drop-watch annotations to support replacement thinking in sleeper recommendations.

#### Scenario: Drop-watch player exists
- **WHEN** at least one rostered player is marked as a drop candidate
- **THEN** the sleeper report includes context that helps the user compare replacement options against those flagged roster spots
