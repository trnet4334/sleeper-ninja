# Yahoo OAuth Settings Integration — Design Spec

**Date:** 2026-04-06
**Status:** Approved

## Overview

Wire the existing Yahoo OAuth backend into the UI across three areas:
1. **Settings → Yahoo Account panel** — connect / disconnect
2. **Settings → Leagues** — auto-sync from Yahoo when connected; keep manual add as fallback
3. **Matchup Analysis page** — gate behind Yahoo OAuth; show connect prompt when not connected

## Scope

- Banner behavior: already correct (`!connected && !authLoading`) — no change required
- All backend OAuth routes already exist (`/connect`, `/callback`, `/status`, `/disconnect`)
- New backend endpoint needed: `GET /api/yahoo/leagues` — fetch user's Yahoo fantasy leagues

Out of scope: real matchup data wiring (page already uses stub data; we only add the auth gate).

## Architecture

### Files to create

| File | Purpose |
|------|---------|
| `src/components/settings/YahooAccountPanel.tsx` | Connect / disconnect UI card |
| `api/yahoo/leagues.ts` | Fetch user's Yahoo MLB fantasy leagues, return `LeagueDefinition[]` |

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useYahooAuth.ts` | Add `disconnect()` async method |
| `src/pages/Settings.tsx` | Add `YahooAccountPanel`; pass `connected` to `LeagueManager` |
| `src/components/settings/LeagueManager.tsx` | When connected, show Yahoo-synced leagues above manual-add form |
| `src/pages/H2HMatchup.tsx` | Add `useYahooAuth` gate; show connect prompt when not connected |

---

## Section 1 — Yahoo Account Panel

### Component: `YahooAccountPanel`

Props:
```typescript
interface Props {
  connected: boolean;
  loading: boolean;
  onDisconnect: () => Promise<void>;
}
```

States:
- **loading**: disabled skeleton
- **connected=false**: amber "Connect Yahoo Fantasy" → `<a href="/api/yahoo/connect">`
- **connected=true**: green "Connected" badge + "Disconnect" button

### Hook update: `useYahooAuth`

Return type gains `disconnect()`:

```typescript
interface YahooAuthState {
  connected: boolean;
  loading: boolean;
  disconnect: () => Promise<void>;
}
```

`disconnect()` flow:
1. `POST /api/yahoo/disconnect`
2. On 2xx → set `connected = false` locally (no refetch)
3. On error → no-op (user can retry)

---

## Section 2 — League Auto-Sync

### New API endpoint: `GET /api/yahoo/leagues`

- Reads `yahoo_token` cookie, validates it (refresh if expired)
- Calls Yahoo Fantasy API: `GET https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues?format=json`
- Returns `LeagueDefinition[]`:

```typescript
interface LeagueDefinition {
  id: string;          // slugified league name
  name: string;        // Yahoo league name
  yahooLeagueId: string; // numeric Yahoo league ID
  season: number;      // current season year
}
```

- 401 if no/invalid token
- 502 if Yahoo API fails

### Hook: `useYahooLeagues`

New hook at `src/hooks/useYahooLeagues.ts`:

```typescript
export function useYahooLeagues(enabled: boolean): {
  leagues: LeagueDefinition[];
  loading: boolean;
}
```

Only fetches when `enabled = true` (i.e., `connected = true`).

### LeagueManager update

When `connected = true`:
- Show Yahoo-synced leagues (from `useYahooLeagues`) with a "From Yahoo" badge
- Sync button to re-fetch (optional, nice-to-have)
- Manual add form remains below, labelled "Add manually"

When `connected = false`:
- Show only manually-added leagues (current behavior)
- Manual add form as usual

Yahoo leagues are **display only** — they do not overwrite `localStorage`. The user's manually-added leagues persist separately. If a Yahoo league already exists in localStorage (matched by `yahooLeagueId`), show it once (deduped).

---

## Section 3 — Matchup Analysis Gate

### H2HMatchup page

Add `useYahooAuth()` at top. Conditional render:

```tsx
if (!connected && !loading) {
  return <YahooConnectPrompt />  // inline component, not a full page
}
// existing page content unchanged
```

### `YahooConnectPrompt` (inline, no separate file)

Simple centered card:
```
┌─────────────────────────────────────┐
│  Matchup Analysis                   │
│                                     │
│  Connect Yahoo Fantasy to view      │
│  your head-to-head matchup data.    │
│                                     │
│  [Connect Yahoo Fantasy]            │
└─────────────────────────────────────┘
```
Button → `<a href="/api/yahoo/connect">`.

---

## Settings Page Layout

Add Yahoo Account panel as a **full-width row** below the existing three-column grid:

```
┌──────────┬────────────┬──────────────┐
│ Leagues  │ Categories │ Preferences  │
└──────────┴────────────┴──────────────┘
┌──────────────────────────────────────┐
│ Yahoo Account                        │
└──────────────────────────────────────┘
```

---

## Data Flow Summary

```
useYahooAuth()
  ├── GET /api/yahoo/status          → connected: boolean
  └── disconnect() → POST /api/yahoo/disconnect → connected = false

useYahooLeagues(connected)
  └── GET /api/yahoo/leagues         → LeagueDefinition[]
        └── Yahoo Fantasy API

H2HMatchup
  └── useYahooAuth() → gate render

LeagueManager
  └── useYahooLeagues(connected) → show Yahoo leagues
      manual add form → useLeagues().addLeague() (localStorage)
```

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| `/api/yahoo/leagues` 401 | `useYahooLeagues` returns `[]`, shows no Yahoo leagues |
| `/api/yahoo/leagues` 502 | Same — fall back silently |
| `disconnect()` fails | No-op; connected state unchanged |
| Yahoo token expired | `api/yahoo/leagues` refreshes token transparently (same pattern as `roster.ts`) |

## Environment Variables

No new env vars. All existing vars apply:
```
YAHOO_CLIENT_ID
YAHOO_CLIENT_SECRET
VITE_APP_URL
COOKIE_SECRET
```
