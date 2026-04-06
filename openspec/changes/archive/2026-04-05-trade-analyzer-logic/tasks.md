## 1. Scoring engine hook

- [x] 1.1 Create `src/hooks/useTradeScoring.ts` with types: `TimeWindow`, `CatDelta`, `AdvantagePoint`, `RiskFlag`, `TradeAnalysis`
- [x] 1.2 Implement `getConsistencyScore(player)` — `1/(1+stdDev(weeklyScores.slice(-4)))`, return `0.5` when data missing
- [x] 1.3 Implement `getRosValue(player, window: TimeWindow)` — `recommendationScore/100` scaled by window (×0.6 week, ×0.8 month, ×1.0 ROS)
- [x] 1.4 Implement `getTradeScore(player, window, myGaps)` — formula with w1=0.50, w2=0.20, w3=0.20, w4=0.10
- [x] 1.5 Implement `normalizeToZ(players, cat)` — compute Z-scores across player pool per category for `projectedZ` approximation
- [x] 1.6 Implement `getCatDeltas(giving, receiving, cats, myRosterRanks)` — per-cat delta with weakness/strength flags
- [x] 1.7 Implement `getGapFitScore(player, catDeltas)` — sum weakness-category Z × gap weight
- [x] 1.8 Implement `MIN_DEPTH` map and `getDepthWarnings(giving, currentRoster)` — positions that fall below minimum
- [x] 1.9 Implement `getAdvantages(analysis)` — 7 rules, return top 3 sorted by score
- [x] 1.10 Implement `getDisadvantages(analysis)` — 7 rules, return top 3 sorted by score
- [x] 1.11 Implement `getRiskFlags(analysis)` — high/medium/low flags sorted by severity
- [x] 1.12 Implement `getNegotiationHint(analysis)` — `compensationMap` lookup, null when net ≥ 0 or < -1.0
- [x] 1.13 Export `useTradeScoring({ giving, receiving, timeWindow, allPlayers })` hook that memoizes and returns full `TradeAnalysis`

## 2. Player search component

- [x] 2.1 Create `src/components/trade/TradePlayerSearch.tsx` — controlled search input with `onAdd(player)` callback
- [x] 2.2 Add dropdown: filter `allPlayers` by name on input change, show max 10 results
- [x] 2.3 Show selected players as chips (name + position + × button) below the input
- [x] 2.4 Enforce max 5 players — disable input and show "已達上限" when 5 selected
- [x] 2.5 Handle click-outside to close dropdown

## 3. CategoryBar update

- [x] 3.1 Add `basePct: number` and `deltaPct: number` props to `CategoryBar` (0–100 each, drive bar widths)
- [x] 3.2 Add optional `weaknessBadge?: boolean` and `strengthBadge?: boolean` props — render 缺口/優勢 badge next to category name
- [x] 3.3 Keep all existing props backward-compatible (no breaking changes)

## 4. TradeAnalyzer page wiring

- [x] 4.1 Add time window state (`useState<TimeWindow>('rest_of_season')`) and three toggle buttons in the header
- [x] 4.2 Add giving/receiving player state (`useState<Player[]>([])`) with add/remove handlers
- [x] 4.3 Render `TradePlayerSearch` for both giving and receiving sides
- [x] 4.4 Call `useTradeScoring` with giving, receiving, timeWindow, and allPlayers
- [x] 4.5 Wire Projected Delta card large number to `analysis.tradeNet` (formatted `+x.xx` / `-x.xx`)
- [x] 4.6 Replace static category rows with `analysis.catDeltas.map(...)` feeding `CategoryBar` with live `basePct`/`deltaPct`/badges
- [x] 4.7 Render Pros section — `analysis.advantages.map(p => <li>✓ {p.text}</li>)` — hidden when empty
- [x] 4.8 Render Cons section — `analysis.disadvantages.map(p => <li>× {p.text}</li>)` — hidden when empty
- [x] 4.9 Render Risk Flags section — severity-colored badges — hidden when empty
- [x] 4.10 Render Negotiation Hint block (`bg-primary-container`) — visible only when `-1.0 < tradeNet < 0`
- [x] 4.11 Show empty state prompt when both sides have 0 players; hide all analysis sections in that case

## 5. Verification

- [x] 5.1 Run `npx tsc --noEmit` — zero type errors
- [x] 5.2 Manually add 1 player to giving, 1 to receiving — confirm trade_net updates and pros/cons appear
- [x] 5.3 Switch time window — confirm trade_net changes
- [x] 5.4 Add player with `delta < -0.5` to receiving — confirm COLD scenario shows in disadvantages
- [x] 5.5 Verify empty state prompt shows when both sides cleared
