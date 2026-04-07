## ADDED Requirements

### Requirement: Display prospect news cards
The Prospects News page SHALL fetch from `/api/news?type=prospects` and render a list of `NewsCard` components, one per item, ordered by `publishedAt DESC`.

#### Scenario: Data loaded successfully
- **WHEN** the page mounts and the API returns items
- **THEN** each item renders as a `NewsCard` with: category tag, player name + team, summary (max 3 lines, ellipsis), source + relative time

#### Scenario: No data in window
- **WHEN** the API returns an empty `items` array
- **THEN** the page displays the empty state: "No prospect news in the last 7 days."

#### Scenario: Loading state
- **WHEN** the API request is in flight
- **THEN** three skeleton placeholder cards are shown

### Requirement: Category filter chips
The page SHALL render `NewsFilterChips` above the card list with options: All, Recalled, Promoted, Optioned, Debut. Multiple selections are supported. Selecting a chip filters the visible cards to those whose `category` matches any selected value.

#### Scenario: All selected (default)
- **WHEN** the page first loads
- **THEN** "All" chip is active and all items are shown

#### Scenario: Single category selected
- **WHEN** user clicks "Recalled"
- **THEN** only cards with `category === 'recalled'` are shown; "All" is deselected

#### Scenario: Multiple categories selected
- **WHEN** user clicks "Recalled" then "Debut"
- **THEN** cards with `category` of either `recalled` or `debut` are shown

### Requirement: NewsCard category tag colors
The `NewsCard` component SHALL render a tag with colors matching the category: RECALLED/DEBUT → `bg-primary/10 text-primary`, PROMOTED → `bg-tertiary/10 text-tertiary`, OPTIONED → `bg-surface-container-high text-on-surface-variant`.

#### Scenario: Recalled tag rendered
- **WHEN** a `NewsCard` with `category = 'recalled'` is rendered
- **THEN** the tag shows "RECALLED" with amber styling (`text-primary`)
