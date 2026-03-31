## ADDED Requirements

### Requirement: All form inputs have associated labels
Every `<input>` element in the application SHALL have an associated `<label>` element (via `htmlFor`/`id` pairing) or an `aria-label` attribute. Placeholder text alone SHALL NOT serve as the accessible label.

#### Scenario: LeagueManager inputs have visually-hidden labels
- **WHEN** LeagueManager is rendered
- **THEN** the "New league name" input has an associated `<label>` with text "New league name"
- **THEN** the "Yahoo league ID" input has an associated `<label>` with text "Yahoo league ID"

#### Scenario: LeagueTabBar inputs have visually-hidden labels
- **WHEN** LeagueTabBar is rendered
- **THEN** the "League name" input has an associated `<label>` with text "League name"
- **THEN** the "Yahoo ID" input has an associated `<label>` with text "Yahoo ID"
