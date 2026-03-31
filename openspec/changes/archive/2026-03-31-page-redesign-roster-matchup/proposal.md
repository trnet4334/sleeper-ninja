## Why

The current My Roster and H2H Matchup pages are functional but minimal — generic card grids that don't surface actionable at-a-glance information. The v4 HTML prototypes in `prototype/UIUX/` define richer layouts aligned to the "Modern Sabermetrician" design system already established in the app, and these two pages need to be brought up to that standard.

## What Changes

- **My Roster page** (`src/pages/MyRoster.tsx`) rebuilt from scratch: 4 summary stat cards (Roster Health, Active Grid, Waiver Priority, FAAB budget), separate hitters table and pitchers table with position badge, player name, key stats, and IL-dimmed rows for injured players.
- **H2H Matchup page** (`src/pages/H2HMatchup.tsx`) rebuilt from scratch: large win-probability ring (SVG), a "Ninja Insight" strategic text card, a category comparison grid showing WIN/LOSS/TOSS badge + my value vs opponent value for each scoring category, and side-by-side my-roster vs opponent-roster columns with live game status.
- No changes to `AppShell`, top nav bar, or side nav bar.
- No new API routes; both pages consume existing hooks (`useRosterData`, `useMatchupAnalysis`, `useCategories`).

## Capabilities

### New Capabilities

- `roster-overview`: Redesigned My Roster page — summary cards + split hitter/pitcher tables replacing the current card-per-player grid.
- `matchup-analysis`: Redesigned H2H Matchup page — win-probability ring + Ninja Insight card + category comparison grid + side-by-side roster columns replacing the current forecast card grid.

### Modified Capabilities

<!-- No spec-level behavior changes; only UI layout is changing. -->

## Impact

- `src/pages/MyRoster.tsx` — full rewrite
- `src/pages/H2HMatchup.tsx` — full rewrite
- Potentially new sub-components under `src/components/roster/` and `src/components/matchup/`
- Existing hooks (`useRosterData`, `useMatchupAnalysis`, `useCategories`) are unchanged
- AppShell, routing, and all nav components are untouched
