## Why

The Trade Analyzer and Stat Explorer pages have functional implementations but their visual presentation lags behind the new designs in `prototype/UIUX/`. The prototype introduces a refined bento-grid layout for Trade Analyzer, a proper SVG radar polygon chart for Team Strength Impact, and a more polished Stat Explorer with horizontal-scroll breakout cards and improved table aesthetics — all while keeping the existing side nav and top nav unchanged.

## What Changes

- **Trade Analyzer**: Migrate the 3-column bento to a 12-col grid matching the prototype (4+4+4), fix the Team Strength Radar to render as an SVG polygon (pre-trade grey vs post-trade amber overlay), resize the radar/category split to 8+4 columns, and align all typography and spacing to the prototype.
- **Stat Explorer**: Upgrade the Breakout Alerts section with left/right scroll controls, improve card layout (round avatar + 2-stat mini-grid + description), replace the plain trendBadge with more varied role-aware labels (ELITE / MVP / SPEED / HOT / COLD / STEADY), and tighten table header and row styling.
- Both pages: typography, spacing, and color-token usage brought in line with the prototype's Manrope headline / Inter body conventions.

## Capabilities

### New Capabilities
- `trade-analyzer-ui`: Revised Trade Analyzer page layout — 12-col bento, SVG radar chart, 8/4 second-row split, Accept Trade CTA button.
- `stat-explorer-ui`: Revised Stat Explorer page layout — scroll-arrow breakout section, enhanced table rows with inline avatar, richer trend labels.

### Modified Capabilities
- `trade-analyzer`: Layout and visual changes only; data wiring (useRosterData, useSleeperAnalysis) stays the same.
- `stat-explorer`: Layout and visual changes only; hooks and filtering logic stays the same.

## Impact

- `src/pages/TradeAnalyzer.tsx` — visual rewrite
- `src/pages/StatExplorer.tsx` — visual rewrite
- `src/components/trade/TeamRadar.tsx` — replace placeholder with inline SVG polygon radar
- `src/components/statexplorer/BreakoutCard.tsx` — update card layout to match prototype
- No API, hook, or routing changes required
