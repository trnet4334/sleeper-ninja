## Why

The Trade Analyzer page currently displays static mock data and ignores the scoring logic defined in `prototype/trade_analyzer_spec_v1.md`. Users need real trade evaluation — a formula-driven score comparing giving-up vs. receiving player value, category impact bars, pros/cons rules, risk flags, and negotiation hints — to make informed decisions.

## What Changes

- **Trade score formula**: `trade_score = 0.50×ROS_value + 0.20×fscore_delta + 0.20×gap_fit_score + 0.10×consistency_score` replaces all stub values
- **Time window switcher**: `this_week | this_month | rest_of_season` toggle in the header, recalculates all scores on change
- **Interactive player search**: Type-ahead search on both giving/receiving sides, max 5 players per side
- **Category delta bars**: Per-category Z-score delta with weakness/strength badges (replaces static percentage bars)
- **Pros/Cons section**: Up to 3 auto-generated advantages and disadvantages sorted by impact score
- **Risk flags**: High/medium/low severity objective risk warnings (depth, injury, schedule)
- **Negotiation hint**: Conditional hint block shown only when `-1.0 < trade_net < 0`
- **Depth warnings**: Per-position minimum roster depth check (`MIN_DEPTH` map)

## Capabilities

### New Capabilities

- `trade-scoring-engine`: Trade score formula, category delta calculation (`getCatDeltas`), gap-fit scoring, consistency scoring, pros/cons rule engine, risk flag generation, negotiation hint logic
- `trade-player-search`: Client-side player search with multi-select (up to 5 per side), time window state, giving/receiving roster management

### Modified Capabilities

- `trade-analyzer-bento`: Projected Delta card shows live `trade_net` value; Category Comparison rows driven by `getCatDeltas()` output; UI additions for pros/cons, risks, negotiation hint sections

## Impact

- `src/pages/TradeAnalyzer.tsx` — major update: wire scoring hook, player search state, time window switcher, conditional sections
- New file: `src/hooks/useTradeScoring.ts` — encapsulates all formula logic (pure functions, no side effects)
- New file: `src/components/trade/TradePlayerSearch.tsx` — search input + player chips for giving/receiving sides
- `src/components/trade/CategoryBar.tsx` — update to accept `delta` and `label` props from scoring hook output
- No API changes; all computation is client-side using data already fetched by `useSleeperAnalysis`
