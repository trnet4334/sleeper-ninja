## Context

`TradeAnalyzer.tsx` currently renders a static bento layout with hardcoded stub values — a fixed `+8.4` net, mocked category bars, and placeholder pros/cons. The data layer (`useSleeperAnalysis`) already exposes `players[]` with `metrics`, `recommendationScore`, `delta`, `weeklyScores`, and `projectedZ` fields. All scoring logic needs to be layered on top of this existing data.

The project has no state management library — all state lives in component `useState`/`useMemo`. The trade scoring logic is purely deterministic (no async calls) so it can be a set of pure utility functions wrapped in a hook.

## Goals / Non-Goals

**Goals:**
- Implement the full `trade_score` formula from `prototype/trade_analyzer_spec_v1.md` as pure TypeScript
- Drive `TradeAnalyzer.tsx` UI sections (projected delta, category bars, pros/cons, risks, negotiation hint) from live computed values
- Support up to 5 players per side, with a simple search-and-select UX
- Support three time windows: `this_week`, `this_month`, `rest_of_season`

**Non-Goals:**
- AI-generated explanations (spec explicitly says pure rule-based, no AI)
- Opponent roster integration — negotiation hint will use generic fallback text (no opponent roster data available)
- Persistence of trade selections across sessions
- Backend or API changes

## Decisions

**1. Pure function hook (`useTradeScoring.ts`)**

All formula functions (`getTradeScore`, `getCatDeltas`, `getGapFitScore`, `getConsistencyScore`, `getAdvantages`, `getDisadvantages`, `getRiskFlags`, `getNegotiationHint`) live in a single hook file as pure functions. The hook takes `{ giving, receiving, timeWindow }` and returns the full analysis. No side effects, easy to unit-test.

**2. Player data source**

Trade selections come from the existing `useSleeperAnalysis` hook data. When a player is added to giving/receiving, their `Player` object is stored in component state. `projectedZ` is derived from `metrics` (Z-score-normalize available metric values at selection time).

**3. `projectedZ` approximation**

The API returns raw metric values, not Z-scores. For the `getCatDeltas` and `getGapFitScore` functions, we normalize per-category values against the full player pool using `(value - mean) / stdDev`. This approximation is computed once at mount and memoized.

**4. `ROS_value` approximation**

Without a dedicated Steamer projection endpoint, `ROS_value` is approximated from `recommendationScore / 100`. `fscore_delta` uses `player.delta`. This keeps the formula functional with current data and can be swapped for real projection data later.

**5. `CategoryBar` extension**

Add `basePct` and `deltaPct` number props (0–100 each) to `CategoryBar` so the bar widths are data-driven. Existing string-based props (`deltaLabel`, `deltaPositive`, `description`) are retained for backward compat.

**6. `TradePlayerSearch` component**

A controlled search input with dropdown of matching players. Selecting adds to a `Player[]` state array. Displays chosen players as removable chips. Max 5 enforcement in the handler.

## Risks / Trade-offs

- **Z-score approximation**: Without true projected Z-scores, category deltas will be rough. The direction (positive/negative) will be correct; magnitude may be off. Acceptable for v1.
- **Missing `weeklyScores`**: If `player.weeklyScores` is absent or empty, `getConsistencyScore` returns 0.5 (neutral). The component handles this gracefully.
- **`myRosterRank` unavailable**: `is_my_strength`/`is_my_weakness` requires knowing this user's league rank per category. Defaulting to `null` (no badge) when rank is unknown is safe.
