## Why

The My Roster page exists but shows an empty "Add League" form even when the user has already connected Yahoo OAuth and has active leagues on their account. The Yahoo roster API endpoint returns empty placeholder data, so there's no real roster shown even when leagues are configured.

## What Changes

- **Auto-sync Yahoo leagues on first visit**: When Yahoo is connected and no leagues exist in localStorage, My Roster auto-fetches the user's leagues from `/api/yahoo/leagues` and imports them without requiring manual action in Settings.
- **Implement real Yahoo roster fetching**: `/api/yahoo/roster` fetches the user's actual team roster for the given league from Yahoo Fantasy API (team players, positions, injury status).
- **Wire My Roster page to Yahoo roster data**: `useRosterData` (or a new `useYahooRoster` hook) fetches from the Yahoo roster endpoint when a Yahoo-backed league is active, instead of the static player database endpoint.
- **Display real player rows**: Player name, position, and injury/roster status from Yahoo replace the currently-empty table.

## Capabilities

### New Capabilities

- `yahoo-roster-display`: Renders real Yahoo roster data on the My Roster page — player rows with name, position, status, and basic stat columns pulled from Yahoo Fantasy API.

### Modified Capabilities

- `roster-overview`: Page now auto-imports Yahoo leagues when connected and no leagues exist, replacing the manual "Add League" form in that scenario.
- `yahoo-fantasy-sync`: The roster sync endpoint (`/api/yahoo/roster`) now returns real player data instead of an empty array.

## Impact

- `api/yahoo/roster.ts` — implement real Yahoo Fantasy API call for team roster
- `src/hooks/useYahooRoster.ts` — new hook to fetch Yahoo roster, returns players array
- `src/pages/MyRoster.tsx` — add auto-sync logic; use Yahoo roster hook when active league has a `yahooLeagueId`
- `src/components/roster/PlayerRow.tsx` — may need to accept Yahoo player shape (name, pos, status)
- No new dependencies required (Yahoo API uses existing cookie-auth pattern)
