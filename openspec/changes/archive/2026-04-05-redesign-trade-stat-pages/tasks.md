## 1. Trade Analyzer — SVG Radar Component

- [x] 1.1 Replace the body of `src/components/trade/TeamRadar.tsx` with an inline SVG pentagon radar: pentagon mesh outline, grey pre-trade polygon (`fill="rgba(51,65,85,0.4)"`, `stroke="#334155"`), amber post-trade polygon (`fill="rgba(217,119,7,0.2)"`, `stroke="#D97706" stroke-width="3"`), and four axis labels (Efficiency top, Health bottom, Upside left-rotated, Schedule right-rotated) positioned with absolute divs around the SVG. Keep `viewBox="0 0 200 200"` and `w-72 h-72` class. Add a `// TODO: compute polygon points from real category Z-scores` comment.
- [x] 1.2 Verify `TeamRadar` still renders without props (no required props needed — it's a static visual for now).

## 2. Trade Analyzer — Page Layout Rewrite

- [x] 2.1 In `src/pages/TradeAnalyzer.tsx`, change the first row grid from `lg:grid-cols-3` to `grid grid-cols-12 gap-6`. Set Giving Up card to `col-span-12 lg:col-span-4`, Receiving card to `col-span-12 lg:col-span-4`, Projected Delta card to `col-span-12 lg:col-span-4`.
- [x] 2.2 Add an "ACCEPT TRADE" button inside the Projected Delta card, below the net delta number. Button classes: `w-full py-4 bg-on-primary-container text-primary-container font-headline font-bold text-sm rounded-lg hover:bg-black transition-colors`. The button is UI-only (no onClick handler needed).
- [x] 2.3 Change the second row grid from `lg:grid-cols-2` to `grid grid-cols-12 gap-6`. Set Team Strength Impact section to `col-span-12 lg:col-span-8`, Category Comparison section to `col-span-12 lg:col-span-4`.
- [x] 2.4 Wrap the `<TeamRadar />` in the Team Strength Impact section with a relative positioning container that shows the four axis labels (Efficiency, Health, Upside, Schedule) as absolute text elements — matching the prototype layout. Classes for labels: `absolute font-headline font-bold text-xs uppercase tracking-widest`.
- [x] 2.5 Add a pre-trade / post-trade legend row above the radar: two `flex items-center gap-2` items — grey dot + "PRE-TRADE" label, amber dot + "POST-TRADE" label in `text-primary`.
- [x] 2.6 Add a footer bar at the bottom of the page with the "NINJA ANALYTICS ENGINE V2.4" tag (tertiary-container/20 background, tertiary text) and a methodology note in `text-[10px] text-on-surface-variant`.

## 3. Stat Explorer — BreakoutCard Redesign

- [x] 3.1 In `src/components/statexplorer/BreakoutCard.tsx`, replace any existing headshot `<img>` with an initials avatar: a `w-16 h-16 rounded-full border-2 border-primary/20 bg-primary-container/30 flex items-center justify-center` div containing a `<span className="font-headline font-bold text-sm text-primary">` with the player's first and last initials (e.g. "SB" for "Shohei Ohtani" → "SO" — take first letter of each word in playerName, max 2 letters).
- [x] 3.2 Below the initials avatar, add a `grid grid-cols-2 gap-2` mini-grid showing two key metrics. For hitters show xwOBA and Barrel% (or the first two available from `player.metrics`); for pitchers show ERA and K%. Each cell: label in `text-[8px] text-on-surface-variant font-black uppercase`, value in `text-xs font-black text-primary`. Use `border-l border-outline-variant/20` on the second cell.
- [x] 3.3 Set card container to `flex-none w-[340px] bg-surface-container-high border border-outline-variant/10 rounded-xl p-4 snap-start hover:border-primary/30 transition-colors group cursor-pointer`. Inner layout: `flex gap-4` with the avatar+mini-grid in a `space-y-3 shrink-0` column and name/position/description in a `flex-1 flex flex-col justify-center min-w-0` column.
- [x] 3.4 Add a description line below the position/team: `<p className="text-xs text-on-surface-variant/80 font-medium leading-tight line-clamp-3">`. Use a static placeholder string based on the player type: hitters → "Strong contact metrics with upside in counting stats.", pitchers → "Elite swing-and-miss stuff with strong xFIP indicators."

## 4. Stat Explorer — Page Layout Updates

- [x] 4.1 In `src/pages/StatExplorer.tsx`, add a `useRef<HTMLDivElement>(null)` for the breakout scroll container. Attach this ref to the scroll row div.
- [x] 4.2 Add left/right arrow buttons next to the "Breakout Alerts" `<h3>` heading. Use a `flex items-center justify-between` wrapper. Button classes: `p-1 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant`. Left button calls `scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })`, right button calls `scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })`. Use `‹` and `›` text or `←` / `→` characters (no external icon dependency needed).
- [x] 4.3 Replace the `trendBadge` function with a new `trendBadge(delta: number, score: number)` function that checks score first: `score >= 90 → ELITE` badge (`bg-tertiary-container/20 text-tertiary border border-tertiary/20`), `score >= 75 → MVP` badge (same colours), `score >= 60 → SPEED` badge (`bg-primary-container/20 text-primary border border-primary/20`), then falls back to HOT/STEADY/COLD by delta. Update the call site in the table row to pass `player.recommendationScore` as the second argument.
- [x] 4.4 In the table `<thead>`, change padding from `p-5` to `p-6` and add `tracking-widest` to match the prototype's wider-spaced headers.
- [x] 4.5 In the table `<tbody>` rows, wrap the player name cell content in a `flex items-center gap-4` div. Add a small `w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 border border-outline-variant/20 flex items-center justify-center` avatar with the player's initials (same helper logic as BreakoutCard). This gives the table rows the same visual language as the prototype.

## 5. Verification

- [x] 5.1 Run `npm run build` (or `npx tsc --noEmit`) and confirm zero TypeScript errors.
- [ ] 5.2 Open Trade Analyzer in the browser. Verify: three equal-width bento cards, SVG radar visible with two polygons and four axis labels, second row is 2/3 + 1/3, "ACCEPT TRADE" button present.
- [ ] 5.3 Open Stat Explorer in the browser. Verify: left/right arrows on Breakout Alerts row function, breakout cards show initials avatar + 2 stats + description, table rows show inline avatar, ELITE/MVP/SPEED labels appear for high-score players.
