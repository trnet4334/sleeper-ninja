## MODIFIED Requirements

### Requirement: Projected Delta card shows live trade_net

The Projected Delta card SHALL display the live `trade_net` value (formatted with leading `+` or `–`) from `useTradeScoring`, replacing any hardcoded value.

#### Scenario: Live value updates on player change
- **WHEN** a player is added or removed from either side
- **THEN** the large net value string in the Projected Delta card updates immediately

---

### Requirement: Category Comparison rows driven by getCatDeltas

The Category Comparison section SHALL render one row per entry from `getCatDeltas()` output. Each row shows the category name, a delta badge, and a dual-segment progress bar with widths proportional to the delta magnitude.

#### Scenario: Positive delta row renders primary color badge
- **WHEN** `catDeltas` entry has `delta > 0`
- **THEN** the badge text is `+{delta.toFixed(2)}` in primary amber color

#### Scenario: Negative delta row renders error color badge
- **WHEN** `catDeltas` entry has `delta < 0`
- **THEN** the badge text is `{delta.toFixed(2)}` in rose/error color

#### Scenario: Weakness badge shown
- **WHEN** `is_my_weakness === true`
- **THEN** a small `缺口` badge appears next to the category name

#### Scenario: Strength badge shown
- **WHEN** `is_my_strength === true`
- **THEN** a small `優勢` badge appears next to the category name

---

## ADDED Requirements

### Requirement: Pros section

Below the Category Comparison, the page SHALL display a "優點" (Advantages) section with up to 3 bullet points from `getAdvantages()`. Each point has a checkmark icon and text.

#### Scenario: Section hidden when no advantages
- **WHEN** `getAdvantages()` returns an empty array
- **THEN** the pros section is not rendered

---

### Requirement: Cons section

Below Pros, a "缺點" (Disadvantages) section SHALL display up to 3 bullet points from `getDisadvantages()`. Each point has an × icon and text.

#### Scenario: Section hidden when no disadvantages
- **WHEN** `getDisadvantages()` returns an empty array
- **THEN** the cons section is not rendered

---

### Requirement: Risk flags section

A "風險警示" section SHALL render each flag from `getRiskFlags()` with color-coded severity indicators:
- High: rose/red badge
- Medium: amber badge
- Low: secondary/muted badge

#### Scenario: Section hidden when no flags
- **WHEN** `getRiskFlags()` returns an empty array
- **THEN** the risk flags section is not rendered

---

### Requirement: Negotiation hint section

A "談判建議" section SHALL show the string from `getNegotiationHint()` in a distinct card (primary-container background).

#### Scenario: Section shown only for small deficit
- **WHEN** `-1.0 < trade_net < 0`
- **THEN** the negotiation hint section is visible

#### Scenario: Section hidden otherwise
- **WHEN** `trade_net >= 0` or `trade_net <= -1.0`
- **THEN** the negotiation hint section is not rendered
