### Requirement: Player search input

`TradePlayerSearch` SHALL display a text input that filters the player pool (all players from `useSleeperAnalysis`) by name, case-insensitive.

#### Scenario: Dropdown appears on focus with text
- **WHEN** user types at least 1 character
- **THEN** a dropdown of up to 10 matching players appears below the input

#### Scenario: Selecting a player adds them to the side
- **WHEN** user clicks a player in the dropdown
- **THEN** the player is added to the giving or receiving list (depending on which side)
- **AND** the input clears

---

### Requirement: Maximum 5 players per side

Each side (giving, receiving) SHALL accept at most 5 players.

#### Scenario: Add button disabled at capacity
- **WHEN** 5 players are already selected on a side
- **THEN** the search input is disabled or shows a "max reached" message

---

### Requirement: Remove player chip

Each selected player SHALL display a removable chip (name + position) with an `×` button.

#### Scenario: Clicking × removes player
- **WHEN** user clicks the `×` on a player chip
- **THEN** the player is removed from the side
- **AND** trade analysis recalculates

---

### Requirement: Empty state prompt

When no players are selected on either side, the page SHALL display a full-width prompt:
> "選好雙方球員後，分析結果將自動出現"

#### Scenario: Analysis sections hidden when empty
- **WHEN** both giving and receiving lists are empty
- **THEN** category delta bars, pros/cons, risk flags, and negotiation hint sections are NOT rendered

---

### Requirement: Time window switcher

Three toggle buttons SHALL appear in the page header: "本週", "本月", "賽季剩餘". The active button has a primary amber underline.

#### Scenario: Switching window recalculates
- **WHEN** user clicks a different time window button
- **THEN** `trade_net` and all dependent sections recompute immediately
