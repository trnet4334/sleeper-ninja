## ADDED Requirements

### Requirement: 12-column bento grid first row
The Trade Analyzer page SHALL use a 12-column CSS grid for the first row, with the Giving Up card spanning 4 columns, the Receiving card spanning 4 columns, and the Projected Delta card spanning 4 columns on large screens (`lg:grid-cols-12`). On small screens all three stack vertically.

#### Scenario: Three-card first row layout on large screen
- **WHEN** the Trade Analyzer page loads on a viewport ≥ 1024px
- **THEN** Giving Up, Receiving, and Projected Delta cards are shown side-by-side in equal 4-column widths

### Requirement: Team Strength Impact + Category Comparison second-row split
The second row SHALL use an 8-column left section for Team Strength Impact and a 4-column right section for Category Comparison on large screens (`lg:col-span-8` / `lg:col-span-4`).

#### Scenario: Second row 8/4 split on large screen
- **WHEN** the Trade Analyzer page loads on a viewport ≥ 1024px
- **THEN** the radar section occupies roughly two-thirds of the width and the category comparison occupies one-third

### Requirement: SVG polygon radar for Team Strength Impact
The Team Strength Impact section SHALL render an inline SVG element containing: a pentagon outline mesh, a grey-filled pre-trade polygon (`fill="rgba(51,65,85,0.4)"`), an amber post-trade polygon (`fill="rgba(217,119,7,0.2)"` with amber stroke), and four axis labels (Efficiency, Health, Upside, Schedule).

#### Scenario: SVG radar visible on page load
- **WHEN** the Trade Analyzer page renders
- **THEN** an `<svg>` element is present with at least two `<polygon>` elements and four axis labels in the surrounding container

### Requirement: Accept Trade CTA button in Projected Delta card
The Projected Delta card SHALL include a full-width "ACCEPT TRADE" button below the net value number. The button SHALL use inverted colours relative to the card (dark text on light background) and include a checkmark icon or label.

#### Scenario: Accept Trade button visible
- **WHEN** the Projected Delta card renders
- **THEN** a button with "ACCEPT TRADE" label is visible at the bottom of the card
