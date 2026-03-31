## Context

Two pages — Trade Analyzer and Stat Explorer — are being rebuilt to match the v4 HTML prototypes in `prototype/UIUX/`. AppShell, routing, and all other pages are untouched. The design system is "Modern Sabermetrician": Manrope headlines, Inter body, amber primary (`primary` token), deep slate surfaces, tonal layering.

Current state:
- `TradeAnalyzerPage`: simple 2-column layout with a verdict chip and category impact grid. Uses `useSleeperAnalysis` and `useCategories`.
- `StatExplorerPage`: 2-column layout with a "Trend Canvas" placeholder and a comparison panel. Uses `useSleeperAnalysis`.

## Goals / Non-Goals

**Goals:**

Trade Analyzer:
- 3-column bento (4+4+4 on lg, stacked on mobile): "Giving Up" card (error-tone header, player rows with projected value, total value out), "Receiving" card (primary-tone header, player rows, total value in), "Projected Delta" card (amber `primary-container` background, net value display, Accept Trade button).
- "Team Strength Impact" section: inline SVG radar (pentagon outline + pre-trade / post-trade polygon fills), axis labels (Efficiency / Health / Upside / Schedule), legend.
- "Category Comparison" section: stacked rows per category — name, delta % badge, dual progress bar (pre-trade fill + delta fill), description text.
- Data sourced from `useSleeperAnalysis` and `useCategories`; Giving Up = first N roster players, Receiving = top waiver candidates. Projected Delta is derived from `topDelta`. All with `// TODO: wire to real trade-builder state`.

Stat Explorer:
- Full-width search input (filters `players` list by name, client-side).
- Role tabs: Hitter / SP / Closer — filters `playerType` and `position` from `useSleeperAnalysis`.
- "Breakout Alerts" horizontally scrolling row: snap-scroll cards from players sorted by `recommendationScore`, showing 2 key stats from `metrics`.
- "Detailed Analytics" table: Player (name + position), Team, AVG, HR, RBI, xwOBA, SB, Trend badge. Trend badge derived from `delta`: positive = "HOT", zero = "STEADY", negative = "COLD". Pagination: 10 rows per page.
- AppShell unchanged.

**Non-Goals:**
- Real trade builder UX with drag-and-drop or player selection. Trade Analyzer shows static/derived data with TODO placeholders.
- Animated sparklines or canvas charts.
- New API routes or changes to existing hooks.
- Changing any other pages.

## Decisions

### 1. Trade Analyzer uses first 2 roster players as "Giving Up" and top 2 waivers as "Receiving"
The prototype shows a static trade scenario. Since there's no trade-builder state yet, the page will derive "Giving Up" from `useRosterData("hitter")` (first 2 players) and "Receiving" from `useSleeperAnalysis("hitter").players` filtered to waivers (top 2 by `recommendationScore`). This avoids empty states while keeping the spec honest about what's placeholder.

*Alternative*: Show empty state with "Select players to trade". Rejected — the prototype is dense and we want to show the layout.

### 2. Team Strength radar as declarative inline SVG
The prototype radar is a static pentagon SVG with pre/post polygon fills. The radar doesn't need to be data-driven at this stage — pre-trade polygon uses fixed points, post-trade uses scaled points derived from `topDelta`. Keeping it as inline SVG avoids any charting library dependency.

*Alternative*: Use Recharts RadarChart. Rejected — adds bundle weight; the radar is decorative/static in this iteration.

### 3. CategoryBar progress bars use hardcoded widths with TODO
Category deltas from `useCategories` are labels only. The actual pre/post percentages are not in the API. Progress bar widths will use placeholder values (50% base + delta offset) with a `// TODO: wire to real category deltas` comment.

### 4. Stat Explorer role tabs use local state to filter `playerType`
"Hitter" maps to `playerType === "hitter"`. "SP" maps to `playerType === "pitcher"` and `position === "SP"`. "Closer" maps to `playerType === "pitcher"` and `position === "CL"`. The filter is applied client-side over the `players` array from the hook. No new API call needed.

### 5. Breakout cards show top 4 players by recommendationScore
Cards are `w-72` flex-none in a `flex overflow-x-auto snap-x` container. Each card shows player name, position, team, 2 metrics from `player.metrics` (first 2 keys), and a 3-line insight stub (`// TODO: wire to real insight text`).

### 6. Trend badge logic
- `delta > 0.5` → amber "HOT" (`text-primary bg-primary/10`)
- `-0.5 ≤ delta ≤ 0.5` → secondary "STEADY"
- `delta < -0.5` → error-tone "COLD"

## Risks / Trade-offs

- **Placeholder trade data**: The "Giving Up" / "Receiving" sections use derived data, not a real trade builder. Risk: misleading to reviewers. Mitigation: clear TODO comments.
- **Radar visual fidelity**: The SVG radar polygon points are hardcoded. They won't dynamically reflect real team strength. Mitigation: a future pass can replace with computed polygon vertices.
- **Search performance**: Client-side filter over all players on keystroke. For large datasets this may lag. Mitigation: acceptable for typical roster sizes (< 500 players); debounce is not needed yet.

## Migration Plan

1. Create new sub-components.
2. Rewrite `TradeAnalyzerPage` (same route, same export name).
3. Rewrite `StatExplorerPage` (same route, same export name).
4. No routing, build, or environment changes needed.
5. Rollback: revert two page files; no other files touched.
