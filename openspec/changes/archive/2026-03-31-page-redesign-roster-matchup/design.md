## Context

Two pages — My Roster and H2H Matchup — are being rebuilt to match the v4 HTML prototypes in `prototype/UIUX/`. The rest of the app (AppShell, top nav, side nav, routing, hooks, API layer) stays untouched. The design system is "Modern Sabermetrician": Manrope headlines, Inter body, amber primary (`#ffb77d` / `primary` token), deep slate surfaces, tonal layering with no divider lines.

Current state:
- `MyRosterPage`: renders one `<article>` card per player from `useRosterData("hitter")`. Shows name, position, delta, and 2 stat chips. No pitchers section, no summary metrics.
- `H2HMatchupPage`: renders a category forecast grid (WIN/LOSS/my/opp values) plus weak categories and pickup suggestions. No win-probability visualization, no side-by-side roster columns.

## Goals / Non-Goals

**Goals:**
- My Roster: 4 summary stat cards (Roster Health %, Active Grid N/12, Waiver Priority #N, FAAB $N) + hitters table (Pos / Player / AVG / HR / RBI / SB / Status) + pitchers table (Pos / Player / ERA / WHIP / K / W-S / Status); IL rows dimmed with error-tone styling.
- H2H Matchup: win-probability ring SVG (percentage arc), Ninja Insight text card, category comparison grid (WIN/LOSS/TOSS badge + my value / opp value per stat), side-by-side my-roster vs opponent-roster columns with live game status.
- Follow the design tokens already in the Tailwind config (amber `primary`, `surface-container-low`, `surface-container-high`, `on-surface`, `on-surface-variant`, `font-headline`).
- Keep new components small and focused; extract sub-components only where they're reused within the same page.

**Non-Goals:**
- Changing `AppShell`, top nav, side nav, or any routing.
- Adding new API routes or modifying existing hooks.
- Implementing real-time WebSocket live game updates (live game status is static data from existing hook).
- Changing any other pages (Sleeper Report, Trade Analyzer, Stat Explorer).

## Decisions

### 1. Separate hitters / pitchers tables instead of a unified grid
The prototype treats batters and pitchers as distinct table sections with different stat columns. Implementing as two independent `<table>` or structured `<div>` grids is cleaner than a single unified component with conditional column logic.

*Alternative*: One generic `PlayerTable` component with a `columns` prop. Rejected — over-engineering for two fixed layouts within one page.

### 2. Win-probability ring as inline SVG
The prototype uses a circular arc SVG for win probability. Using an inline SVG (not a canvas or third-party chart lib) keeps the bundle unchanged and is straightforward to animate with CSS `stroke-dasharray`/`stroke-dashoffset`. No new dependency needed.

*Alternative*: Use an existing chart library (e.g., Recharts `RadialBarChart`). Rejected — adds bundle weight for a single decorative element.

### 3. Mock data for summary cards and Ninja Insight
`useRosterData` and `useMatchupAnalysis` don't currently return roster-health %, FAAB balance, or Ninja Insight text. These will be hard-coded as placeholder values in the page until the data layer exposes them — keeping the UI change and data-model change decoupled.

*Alternative*: Extend hooks first. Rejected — creates scope creep; the prototype spec is UI-only.

### 4. IL dimming via Tailwind opacity utility
Injured players are identified via `player.rosterState === "il"` (or a status field from the hook). IL rows render with `opacity-50` and an amber/red status badge. No special component needed.

### 5. New sub-components scoped to page directories
- `src/components/roster/RosterSummaryCard.tsx` — reusable within MyRoster for the 4 summary cards
- `src/components/matchup/WinProbabilityRing.tsx` — reusable within H2H for the SVG ring
- `src/components/matchup/CategoryRow.tsx` — one row in the category comparison grid

These are not exported as global UI primitives because they have no use outside their respective pages.

## Risks / Trade-offs

- **Hook shape mismatch**: `useRosterData` currently returns only hitters (`useRosterData("hitter")`). The new roster page needs both hitters and pitchers. The page will call `useRosterData("hitter")` and `useRosterData("pitcher")` separately — two hook calls instead of one. No hook changes needed, but if the hook is stateful/expensive this doubles calls. Mitigation: hooks are memoised by player type so this is safe.
- **Summary card placeholders**: Roster Health %, FAAB, and Waiver Priority are hard-coded. They will show static values until a future data-layer change populates them. Risk: looks like broken data to QA reviewers. Mitigation: add a `// TODO: wire to real data` comment.
- **SVG arc math**: Stroke-based circular progress requires correct `stroke-dasharray` calculation. Mitigation: well-understood CSS pattern; document the formula in code.

## Migration Plan

1. Create new sub-components.
2. Rewrite `MyRosterPage` — page remains at the same route, same export name.
3. Rewrite `H2HMatchupPage` — same.
4. No routing, build, or environment changes needed.
5. Rollback: revert the two page files; no other files touched.
