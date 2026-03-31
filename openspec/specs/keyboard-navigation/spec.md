### Requirement: Mobile nav drawer has aria-expanded and sidebar label
The Menu button in AppShell SHALL have `aria-expanded` set to `true` when the drawer is open and `false` when closed. The `<aside>` navigation element SHALL have `aria-label="Main navigation"`.

#### Scenario: Menu button announces open state
- **WHEN** the mobile nav drawer is open
- **THEN** the Menu button has `aria-expanded="true"`

#### Scenario: Menu button announces closed state
- **WHEN** the mobile nav drawer is closed
- **THEN** the Menu button has `aria-expanded="false"`

### Requirement: SleeperReport table headers have scope attribute
All `<th>` elements in the SleeperReport player table SHALL have `scope="col"`.

#### Scenario: Column headers have scope
- **WHEN** the player table is rendered
- **THEN** every `<th>` element has `scope="col"`

### Requirement: SleeperReport table rows are keyboard accessible
Player table rows in SleeperReport SHALL be navigable and activatable by keyboard. Each `<tr>` with an `onClick` handler SHALL have `tabIndex={0}` and an `onKeyDown` handler that activates the row on Enter or Space.

#### Scenario: Row activatable by keyboard
- **WHEN** a player table row has focus
- **THEN** pressing Enter or Space triggers the row's click action (showing player detail)

### Requirement: SleeperReport loading state announced to screen readers
The loading indicator in SleeperReport SHALL be wrapped in an `aria-live="polite"` region so screen reader users are informed when data finishes loading.

#### Scenario: Loading completion announced
- **WHEN** the SleeperReport data finishes loading
- **THEN** an `aria-live="polite"` region announces the change (content area updates)
