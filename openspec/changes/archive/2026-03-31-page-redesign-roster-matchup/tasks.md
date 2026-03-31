## 1. Roster — sub-components

- [x] 1.1 Create `src/components/roster/RosterSummaryCard.tsx` — props: `label: string`, `value: string`, `accent?: boolean`; renders a `surface-container-low` card with amber accent label
- [x] 1.2 Create `src/components/roster/PlayerRow.tsx` — props: `player: ApiPlayer`, `columns: string[]`, `il?: boolean`; renders a table row with `opacity-50` when `il` is true and a position badge

## 2. Roster — page rewrite

- [x] 2.1 Rewrite `src/pages/MyRoster.tsx` — replace existing implementation with: 4 `RosterSummaryCard` components (Roster Health 92%, Active Grid 12/12, Waiver Priority #4, FAAB $72 as placeholder values with `// TODO: wire to real data`); call `useRosterData("hitter")` and `useRosterData("pitcher")` separately
- [x] 2.2 Add hitters section to `MyRosterPage` — `<section>` with label "Hitters", structured table header row (Pos / Player / AVG / HR / RBI / SB / Status), mapped `PlayerRow` for each hitter; show empty-state text when list is empty
- [x] 2.3 Add pitchers section to `MyRosterPage` — `<section>` with label "Pitchers", structured table header row (Pos / Player / ERA / WHIP / K / W-S / Status), mapped `PlayerRow` for each pitcher; show empty-state text when list is empty

## 3. Matchup — sub-components

- [x] 3.1 Create `src/components/matchup/WinProbabilityRing.tsx` — props: `probability: number` (0–100); renders inline SVG with a circular arc (stroke-dasharray / stroke-dashoffset) in amber primary color, percentage label centered; defaults to 50 when probability is undefined
- [x] 3.2 Create `src/components/matchup/CategoryRow.tsx` — props: `category: string`, `myValue: string | number`, `opponentValue: string | number`, `result: "WIN" | "LOSS" | "TOSS"`; renders one category comparison row with colored badge (green/red/amber)

## 4. Matchup — page rewrite

- [x] 4.1 Rewrite `src/pages/H2HMatchup.tsx` — replace existing implementation; add `opponentName` variable (from `useMatchupAnalysis` data or fallback `"Matchup Analysis"`); render page heading `"H2H Performance vs. {opponentName}"`
- [x] 4.2 Add `WinProbabilityRing` to `H2HMatchupPage` — pass `data?.winProbability ?? 50` as `probability` prop; position alongside the Ninja Insight card in a flex row (stacks on mobile)
- [x] 4.3 Add Ninja Insight card to `H2HMatchupPage` — `surface-container-low` card with amber header "Ninja Insight" and `data?.insight ?? "Analyzing matchup…"` body text
- [x] 4.4 Add category comparison grid to `H2HMatchupPage` — replace the forecast grid with a list of `CategoryRow` components mapped from `data?.forecast`; each row receives `result`, `myValue`, `opponentValue` from the forecast item
- [x] 4.5 Add side-by-side roster columns to `H2HMatchupPage` — two `<div>` columns in a `flex-col md:flex-row` container; left column "My Roster" lists my players (name + team), right column "Opponent" lists opponent players; columns stack on mobile

## 5. Verify

- [x] 5.1 Run `npm run test` — all tests pass
- [x] 5.2 Run `npm run build` — no errors
- [x] 5.3 Run `npm run lint` — no errors
