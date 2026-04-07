## 1. Yahoo Roster API

- [x] 1.1 Add `parseYahooRoster()` pure function in `api/yahoo/roster.ts` that converts Yahoo Fantasy API roster JSON into `YahooPlayer[]` (playerName, team, position, selectedPosition, status)
- [x] 1.2 Add `fetchUserTeamKey()` helper that calls `GET /fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues;league_keys=mlb.l.{id}/teams;use_login=1?format=json` and returns the team key string, or `null` if no team found
- [x] 1.3 Add `fetchYahooRoster()` helper that calls `GET /fantasy/v2/team/{team_key}/roster?format=json` and returns `YahooPlayer[]`
- [x] 1.4 Replace stub response in `handler()` with real two-call flow: find team key → fetch roster → return parsed players; return 404 with `{ status: "no_team" }` if no team key found
- [x] 1.5 Apply token refresh pattern to new roster handler (same as leagues.ts pattern — refresh before calls if token expired, return updated Set-Cookie)

## 2. Frontend Hook

- [x] 2.1 Create `src/hooks/useYahooRoster.ts` with `useYahooRoster(yahooLeagueId: string)` hook that fetches `/api/yahoo/roster?league_id={yahooLeagueId}`
- [x] 2.2 Hook splits response into `hitters` and `pitchers` arrays: pitchers have a primary `position` containing `"SP"`, `"RP"`, or `"P"`; all others are hitters
- [x] 2.3 Hook returns `{ hitters, pitchers, loading }` — empty arrays while loading or on error

## 3. My Roster Page

- [x] 3.1 Add auto-import effect to `MyRosterPage`: when `connected && !authLoading && leagues.length === 0`, fetch `/api/yahoo/leagues`, call `addLeague` for each result, and show a loading state while fetching
- [x] 3.2 Replace `useRosterData` calls in `RosterContent` with `useYahooRoster(activeLeague?.yahooLeagueId ?? "")`, passing hitters and pitchers to the respective `TableSection` components
- [x] 3.3 Map `YahooPlayer` to `PlayerRow` props: set `metrics={}` so stat cells render `"–"`, pass `il={["IL","IL10","IL60"].includes(player.selectedPosition)}` for the IL badge
- [x] 3.4 Add loading skeleton (3 placeholder rows) to each `TableSection` while `useYahooRoster` is loading
