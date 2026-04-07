## ADDED Requirements

### Requirement: Display injury cards
The Injury Update page SHALL fetch from `/api/news?type=injuries` and render a list of `InjuryCard` components ordered by `publishedAt DESC`.

#### Scenario: Data loaded successfully
- **WHEN** the page mounts and the API returns items
- **THEN** each item renders as an `InjuryCard` with: IL status tag, player name + team + position, description (max 3 lines), optional return date, source + relative time

#### Scenario: No injuries in window
- **WHEN** the API returns an empty `items` array
- **THEN** the page displays: "No injury updates in the last 14 days."

#### Scenario: Loading state
- **WHEN** the API request is in flight
- **THEN** three skeleton placeholder cards are shown

### Requirement: IL status filter chips
The page SHALL render `NewsFilterChips` with options: All, IL10, IL15, IL60, DTD, RTN. Filtering works the same as Prospects News (multi-select, matches `ilStatus` field).

#### Scenario: RTN filter selected
- **WHEN** user clicks "RTN"
- **THEN** only cards with `ilStatus === 'RTN'` are shown

### Requirement: InjuryCard status tag colors
The `InjuryCard` SHALL apply IL-status-specific colors: IL10 → amber, IL15 → orange, IL60 → rose, DTD → yellow, RTN → green.

#### Scenario: IL60 tag rendered
- **WHEN** an `InjuryCard` with `ilStatus = 'IL60'` is rendered
- **THEN** the tag shows "IL60" with `bg-rose-400/15 text-rose-400` styling

### Requirement: Return date display
The `InjuryCard` SHALL display `returnDate` when present, formatted as "Return est: MMM DD". When absent, the field is omitted entirely.

#### Scenario: Return date present
- **WHEN** `returnDate` is a valid ISO date string
- **THEN** "Return est: Apr 20" is shown below the description

#### Scenario: Return date absent
- **WHEN** `returnDate` is null or undefined
- **THEN** no return date line is rendered
