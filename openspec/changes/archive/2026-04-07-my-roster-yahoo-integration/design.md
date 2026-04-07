## Context

The My Roster page has full UI scaffolding (table sections, PlayerRow, summary cards) but no real data. Two problems:

1. **Empty leagues state**: `leagues` in localStorage starts empty. The user must manually add leagues via a form even after completing Yahoo OAuth. There is no auto-import.
2. **Stub roster API**: `/api/yahoo/roster` returns two hardcoded player names regardless of the `league_id` parameter. No real Yahoo API call is made.

Existing building blocks available:
- `useYahooAuth()` — checks `/api/yahoo/status` (cookie-based, runs on mount)
- `useYahooLeagues(enabled)` — fetches `/api/yahoo/leagues`, returns `LeagueDefinition[]`
- `useCategoryContext().addLeague()` — persists a league into localStorage
- `api/yahoo/leagues.ts` — real Yahoo API call, already working
- `api/yahoo/roster.ts` — stub, needs real implementation
- `PlayerRow` — renders a player row; expects `metrics` dict (can be empty)

## Goals / Non-Goals

**Goals:**
- When Yahoo is connected and localStorage has no leagues, My Roster auto-fetches and imports Yahoo leagues without manual user action.
- `/api/yahoo/roster` fetches the authenticated user's actual team roster for the given Yahoo league ID from Yahoo Fantasy API.
- My Roster page uses the Yahoo roster data to populate hitter and pitcher tables.
- Stat columns show "–" for all values (real stats stay out of scope; Yahoo doesn't return per-player stats on the roster endpoint).

**Non-Goals:**
- Fetching per-player fantasy stats from Yahoo (separate, heavier API calls).
- Showing waiver wire or trade targets on this page.
- Supporting leagues without a `yahooLeagueId` (manual leagues can still be added via the existing form).

## Decisions

### 1. Auto-import trigger: page-level effect, not context-level

**Decision**: The auto-sync logic lives in `MyRosterPage` using `useEffect`, not in `CategoryContext` or `AppShell`.

**Rationale**: This is page-specific behavior — other pages don't need it. Keeping it local avoids coupling the global context to Yahoo auth state. The effect checks `connected && !loading && leagues.length === 0`, then calls `useYahooLeagues` and bulk-adds results via `addLeague`.

**Alternative considered**: Triggering auto-sync on every app load in `AppShell`. Rejected because it could fire on pages other than My Roster, causing unexpected network calls.

### 2. Yahoo roster endpoint: two-call approach (find team → fetch roster)

**Decision**: `/api/yahoo/roster?league_id={yahooLeagueId}` makes two Yahoo API calls:
1. `GET /fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues;league_keys=mlb.l.{id}/teams;use_login=1?format=json` — finds the user's team key in the league.
2. `GET /fantasy/v2/team/{team_key}/roster?format=json` — fetches the full roster for that team.

**Alternative considered**: Single combined sub-resource call with `/roster` appended. Yahoo's nested resource chaining is fragile to parse and not well-documented for edge cases; the two-call approach is clearer and easier to debug.

### 3. Yahoo player → PlayerRow mapping: thin adapter, not new component

**Decision**: Create a `YahooPlayer` interface (`{ playerName, team, position, selectedPosition, status }`). Map it to the shape PlayerRow already accepts by setting `metrics: {}`. Stat cells will show "–" for all columns.

**Rationale**: Avoids a new component and keeps the UI consistent. Stat columns are already defined as strings; empty metrics are a valid render state.

**Alternative considered**: New `YahooPlayerRow` component. Overkill — the only difference is empty metrics and a different status badge logic, both achievable via props.

### 4. IL detection: use `selected_position` from Yahoo response

**Decision**: A player is treated as IL if their `selected_position.position` value is `"IL"` or `"IL10"` or `"IL60"`. This maps to the `il` prop on `PlayerRow`.

**Rationale**: Yahoo uses selected position to indicate fantasy IL slot assignment, which is the actionable signal (player is on your IL, not just injured).

### 5. Hitter vs Pitcher split: use `display_position` from Yahoo response

**Decision**: Players whose `display_position` contains `"SP"`, `"RP"`, or `"P"` go in the pitchers table; all others go in hitters.

**Rationale**: Yahoo's `primary_position` is the player's MLB position, which is the cleanest split point. `display_position` handles two-way players (e.g., `"SP, OF"`) — a substring check for pitcher positions is sufficient.

## Risks / Trade-offs

- **Yahoo API structure changes** → Mitigation: isolate all parsing in a `parseYahooRoster()` pure function (easy to update/test).
- **Yahoo API rate limits** → Mitigation: no caching layer added now; rate limits are generous for single-user personal apps. Can add cache headers later.
- **Token expiry during two-call sequence** → Mitigation: token is refreshed before the first call (existing pattern); both calls use the same token record within a single request handler execution.
- **User has no team in the league** (e.g., commissioner-only account) → Mitigation: API returns `{ status: "no_team" }` with 404; UI shows "No team found for this league."
- **Multiple leagues auto-imported** → First league in the Yahoo response becomes the `activeLeague` automatically (existing `handleAddLeague` behavior sets active to new league if none active).

## Migration Plan

1. Update `api/yahoo/roster.ts` in-place — no new route needed.
2. Add `useYahooRoster` hook.
3. Update `MyRosterPage` to wire auto-sync and Yahoo roster hook.
4. No database migrations, no new env vars.
5. Rollback: revert the three files; no persistent state is changed server-side.

## Open Questions

- Should we show bench players (`BN`) in the main table or a separate section? **Decision for now**: include them with position shown as their primary position (not "BN"), same as active players.
- Does Yahoo return team abbreviation on the roster endpoint? **Assumption**: yes, via `editorial_team_abbr` on each player. If not, show empty string.
