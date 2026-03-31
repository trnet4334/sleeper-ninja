## Why

The Trade Analyzer and Stat Explorer pages are minimal placeholders that don't reflect the richer v4 layouts in `prototype/UIUX/`. The Trade Analyzer shows a simple verdict chip; the prototype calls for a 3-column bento with "Giving Up" / "Receiving" player cards, a Projected Delta summary, a SVG team-strength radar, and category comparison bars. The Stat Explorer shows a static comparison panel; the prototype calls for a search bar, role tabs, horizontally scrolling "Breakout Alerts" cards, and a full detailed analytics table with trend badges.

## What Changes

- **Trade Analyzer page** (`src/pages/TradeAnalyzer.tsx`) rebuilt: "Giving Up" card (players going out with projected value), "Receiving" card (players coming in with projected value), "Projected Delta" amber summary card (net value + CTA), "Team Strength Impact" SVG radar (pentagon pre/post polygons), and "Category Comparison" stacked progress bars with delta labels.
- **Stat Explorer page** (`src/pages/StatExplorer.tsx`) rebuilt: full-width search input, Hitter/SP/Closer role tabs, horizontally scrolling "Breakout Alerts" player cards, and "Detailed Analytics" table (Player / Team / AVG / HR / RBI / xwOBA / SB / Trend badge) with result count and pagination.
- No changes to `AppShell`, top nav, or side nav.
- No new API routes; both pages consume existing hooks (`useSleeperAnalysis`, `useCategories`, `useRosterData`).

## Capabilities

### New Capabilities

- `trade-analyzer-bento`: Redesigned Trade Analyzer page — bento 3-col grid with giving/receiving/delta cards + radar + category bars.
- `stat-explorer-search-table`: Redesigned Stat Explorer page — search + role tabs + breakout scroll cards + detailed analytics table.

### Modified Capabilities

<!-- No spec-level behavior changes; only UI layout is changing. -->

## Impact

- `src/pages/TradeAnalyzer.tsx` — full rewrite
- `src/pages/StatExplorer.tsx` — full rewrite
- New sub-components: `src/components/trade/PlayerTradeCard.tsx`, `src/components/trade/CategoryBar.tsx`, `src/components/trade/TeamRadar.tsx`, `src/components/statexplorer/BreakoutCard.tsx`
- Existing hooks (`useSleeperAnalysis`, `useCategories`, `useRosterData`) are unchanged
- AppShell, routing, and nav components are untouched
