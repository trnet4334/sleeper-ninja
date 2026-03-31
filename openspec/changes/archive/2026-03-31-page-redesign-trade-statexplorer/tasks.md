## 1. Trade Analyzer — sub-components

- [x] 1.1 Create `src/components/trade/PlayerTradeCard.tsx` — props: `player: { playerName: string; position: string; team: string; projValue: number }`, `tone: "giving" | "receiving"`; renders a `surface-container-high` row with player name, position+team sub-label in `text-xs`, and projected value label in amber; used inside both Giving Up and Receiving cards
- [x] 1.2 Create `src/components/trade/CategoryBar.tsx` — props: `category: string`, `deltaLabel: string`, `deltaPositive: boolean`, `description: string`; renders a stacked row with category name, colored delta badge, dual-segment `h-1.5` progress bar (base fill 50% in `surface-container-highest`, delta fill in primary or error), and description text
- [x] 1.3 Create `src/components/trade/TeamRadar.tsx` — no props (static/decorative); renders an inline SVG (200×200 viewBox) with: three concentric circle outlines (opacity-10), a grey pre-trade pentagon polygon, an amber post-trade polygon (fill `rgba(217,119,7,0.2)`, stroke amber), and four axis text labels (Efficiency top, Health bottom, Upside left, Schedule right); add `// TODO: compute polygon vertices from real team-strength data`

## 2. Trade Analyzer — page rewrite

- [x] 2.1 Rewrite `src/pages/TradeAnalyzer.tsx` — add imports; call `useRosterData("hitter")` for giving-up candidates and `useSleeperAnalysis("hitter")` for receiving candidates; derive `givingPlayers` (first 2 roster players), `receivingPlayers` (first 2 waiver players by `recommendationScore`), `totalOut` and `totalIn` (sum of `recommendationScore` as proxy for projected value), `netDelta` (`totalIn - totalOut`); add `// TODO: replace with real trade-builder state`
- [x] 2.2 Add 3-column bento grid to `TradeAnalyzerPage` — `grid grid-cols-1 gap-6 lg:grid-cols-3`; col 1: "Giving Up" card (`surface-container-low`, error-tone header, `PlayerTradeCard` for each giving player, "Total Value Out" footer); col 2: "Receiving" card (`surface-container-low`, primary-tone header, `PlayerTradeCard` for each receiving player, "Total Value In" footer); col 3: "Projected Delta" card (`bg-primary-container text-on-primary-container`, large net delta value, "ACCEPT TRADE" button, methodology footnote in small text)
- [x] 2.3 Add Team Strength Impact section to `TradeAnalyzerPage` — `surface-container-low` card spanning full width; `flex items-center justify-between` header with legend; render `<TeamRadar />` centered; legend shows grey dot "PRE-TRADE" and amber dot "POST-TRADE"
- [x] 2.4 Add Category Comparison section to `TradeAnalyzerPage` — `surface-container-low` card; map over `hitterCats.slice(0, 4)` from `useCategories`; render one `CategoryBar` per category with alternating positive/negative placeholder deltas (+18%, -4%, +12%, stable) and short description strings; add `// TODO: wire to real category impact data`

## 3. Stat Explorer — sub-components

- [x] 3.1 Create `src/components/statexplorer/BreakoutCard.tsx` — props: `player: PlayersResponse["players"][number]`; renders a `w-72 flex-none` `surface-container-high` card with: player name (font-headline font-black), position+team sub-label, two stat cells from `Object.entries(player.metrics).slice(0,2)` (each showing stat key + value in primary amber), and a placeholder insight line `"// TODO: wire to real insight text"` displayed as `"Advanced metrics indicate strong upside."`

## 4. Stat Explorer — page rewrite

- [x] 4.1 Rewrite `src/pages/StatExplorer.tsx` — add local state: `search: string` (empty string default), `role: "hitter" | "sp" | "closer"` ("hitter" default), `page: number` (1 default); call `useSleeperAnalysis("hitter")` and `useSleeperAnalysis("pitcher")` to get both datasets; derive `allPlayers` by filtering on role: "hitter" → hitter data, "sp" → pitcher players where `position === "SP"`, "closer" → pitcher players where `position === "CL"` or `position === "RP"`; then filter by `search` (case-insensitive `playerName.includes`)
- [x] 4.2 Add search bar and role tabs to `StatExplorerPage` — full-width `<input>` with `bg-surface-container-lowest ring-1 ring-outline-variant/10 focus:ring-primary rounded-xl py-4 pl-12 pr-4` and a search label; role tabs row below with three buttons (Hitter / SP / Closer), active tab gets `text-primary border-b-2 border-primary`, inactive gets `text-on-surface-variant hover:text-on-surface`
- [x] 4.3 Add Breakout Alerts section to `StatExplorerPage` — sort `allPlayers` by `recommendationScore` descending, take top 6; render a `flex gap-4 overflow-x-auto snap-x pb-4` row of `<BreakoutCard />` components; add "Hot Trend" amber badge + "Breakout Alerts" heading above the scroll row
- [x] 4.4 Add Detailed Analytics table to `StatExplorerPage` — derive `pagePlayers = allPlayers.slice((page-1)*10, page*10)`; render a `surface-container-low rounded-xl overflow-hidden` table with header cols: Player / Team / AVG / HR / RBI / xwOBA / SB / Trend; each row shows player name + position sub-label, team, metric values from `player.metrics` (use `"–"` fallback), and a Trend badge derived from `player.delta` (> 0.5 → amber "HOT", < -0.5 → rose "COLD", else secondary "STEADY"); add result count `"Showing N-M of total"` and PREV/NEXT buttons (PREV disabled on page 1, NEXT disabled on last page)

## 5. Verify

- [x] 5.1 Run `npm run test` — all tests pass
- [x] 5.2 Run `npm run build` — no errors
- [x] 5.3 Run `npm run lint` — no errors
