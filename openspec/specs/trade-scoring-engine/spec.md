### Requirement: Trade score formula

`useTradeScoring` SHALL compute `trade_score` per player using:
```
trade_score = 0.50 × ROS_value + 0.20 × fscore_delta + 0.20 × gap_fit_score + 0.10 × consistency_score
trade_net   = Σ trade_score(receiving) - Σ trade_score(giving)
```

#### Scenario: trade_net positive when receiving side is stronger
- **GIVEN** receiving players have higher `recommendationScore` and `delta` than giving players
- **THEN** `trade_net > 0`

#### Scenario: trade_net is zero with no players selected
- **GIVEN** both giving and receiving arrays are empty
- **THEN** `trade_net === 0`

---

### Requirement: Time window affects ROS_value

`getRosValue(player, window)` SHALL return different values per time window:
- `this_week`: uses `player.weeklyProjection` if available, else `recommendationScore / 100 * 0.6`
- `this_month`: `recommendationScore / 100 * 0.8`
- `rest_of_season`: `recommendationScore / 100`

Switching the time window recalculates `trade_net`, `catDeltas`, advantages, disadvantages, risk flags, and negotiation hint.

#### Scenario: Score changes on window switch
- **WHEN** user switches from `rest_of_season` to `this_week`
- **THEN** `trade_net` value changes (unless all values happen to be equal)

---

### Requirement: Category delta calculation

`getCatDeltas(giving, receiving, cats)` SHALL return one entry per category with:
- `cat`: category key
- `delta`: `receiving_total - giving_total` (sum of projected Z-scores)
- `is_my_weakness`: `myRosterRank >= 9` — defaults to `null` when rank unavailable
- `is_my_strength`: `myRosterRank <= 4` — defaults to `null` when rank unavailable

#### Scenario: Positive delta when receiving player has higher Z in category
- **GIVEN** receiving player has `projectedZ.HR = 1.5` and giving player has `projectedZ.HR = 0.5`
- **THEN** `catDeltas.find(c => c.cat === 'HR').delta === 1.0`

---

### Requirement: Gap-fit score

`getGapFitScore(player, myGaps)` SHALL:
- Only sum categories where `is_my_weakness === true`
- Multiply `player.projectedZ[cat]` by `Math.max(0, -gap.leagueZScore)`
- Return `0` when `myGaps` is empty

---

### Requirement: Consistency score

`getConsistencyScore(player)` SHALL:
- Return `1 / (1 + stdDev(player.weeklyScores.slice(-4)))`
- Return `0.5` when `player.weeklyScores` is absent or has fewer than 2 entries

---

### Requirement: Advantages (up to 3)

`getAdvantages(tradeAnalysis)` SHALL return at most 3 points sorted by descending impact score. Points are generated from:
1. `trade_net > 0.1` → overall positive value text
2. Category gap filled (`delta > 0 && is_my_weakness`) — gap fill points score doubled
3. Receiving player hotness > 0.5 → hot streak text
4. Receiving player has 3+ position eligibilities
5. High-scarcity category (SB, ERA, SV) improved
6. Receiving consistency > giving consistency by > 0.1

---

### Requirement: Disadvantages (up to 3)

`getDisadvantages(tradeAnalysis)` SHALL return at most 3 points sorted by descending impact score. Points are generated from:
1. `trade_net < -0.1` → overall negative value text
2. Strength category damaged (`delta < -0.3 && is_my_strength`) — multiplied by 1.5
3. Giving player hotness > 0.5 → selling low text
4. Receiving player hotness < -0.5 → buying cold text
5. Position depth falls below `MIN_DEPTH`
6. Receiving player `ilCount >= 2`
7. Giving consistency > receiving consistency by > 0.1

---

### Requirement: Risk flags

`getRiskFlags(tradeAnalysis)` SHALL return flags sorted high → medium → low:
- **High**: receiving player on IL; position depth drops to 1 after trade
- **Medium**: weekly starts decrease by 2+; receiving player IL return > 21 days; giving player last week > 130% of season avg
- **Low**: receiving schedule difficulty is `'hard'`; receiving player IL return ≤ 7 days

---

### Requirement: Negotiation hint

`getNegotiationHint(tradeAnalysis)` SHALL:
- Return `null` when `trade_net >= 0` or `trade_net < -1.0`
- Return a category-specific string from `compensationMap` keyed by the biggest losing category
- Fall back to generic text if category not in map

#### Scenario: Hint shown for small negative trade
- **GIVEN** `trade_net === -0.5` and biggest loss category is `SB`
- **THEN** result contains "Sprint Speed" or "速度型" text (from `SB` entry in `compensationMap`)

#### Scenario: No hint for large deficit
- **GIVEN** `trade_net === -2.0`
- **THEN** `getNegotiationHint` returns `null`
