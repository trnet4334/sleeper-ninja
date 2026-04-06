# Yahoo OAuth Settings Integration — Design Spec

**Date:** 2026-04-06
**Status:** Approved

## Overview

Wire the existing Yahoo OAuth backend into the UI. The connect banner already works; this spec covers exposing connect/disconnect controls in the Settings page and updating `useYahooAuth` to support imperative disconnect.

## Scope

- Banner behavior: already correct — no change required
- Settings page: add a "Yahoo Account" panel (connect / disconnect)
- `useYahooAuth` hook: expose a `disconnect()` method

Out of scope: new API endpoints (all backend routes already exist).

## Architecture

### Files to create

| File | Purpose |
|------|---------|
| `src/components/settings/YahooAccountPanel.tsx` | UI card — shows connection status, connect link, disconnect button |

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useYahooAuth.ts` | Add `disconnect()` async method that calls `POST /api/yahoo/disconnect` and updates local state |
| `src/pages/Settings.tsx` | Import `useYahooAuth` and `YahooAccountPanel`; add fourth card to the grid |

## Data Flow

```
Settings page
  └── useYahooAuth()  →  GET /api/yahoo/status  →  { connected: boolean }
        └── disconnect()  →  POST /api/yahoo/disconnect  →  clears cookie
                              └── sets connected = false locally (no refetch)

YahooAccountPanel
  ├── connected=false  →  <a href="/api/yahoo/connect"> (full-page redirect → Yahoo OAuth)
  └── connected=true   →  <button onClick={disconnect}>
```

## Component Spec: YahooAccountPanel

Props:
```typescript
interface Props {
  connected: boolean;
  loading: boolean;
  onDisconnect: () => Promise<void>;
}
```

States:
- **loading**: show skeleton / disabled state
- **connected=false**: amber "Connect Yahoo Fantasy" link button → `/api/yahoo/connect`
- **connected=true**: green "Connected" status badge + "Disconnect" button

## Hook Spec: useYahooAuth (updated)

```typescript
interface YahooAuthState {
  connected: boolean;
  loading: boolean;
  disconnect: () => Promise<void>;
}
```

`disconnect()`:
1. Calls `POST /api/yahoo/disconnect`
2. On success (any 2xx): sets `connected = false` immediately
3. On error: no state change (leave UI as-is, let user retry)

## Settings Page Layout

Existing three-column grid gains a fourth card:

```
┌──────────┬──────────┬──────────┬──────────────────┐
│ Leagues  │Categories│Prefs     │ Yahoo Account    │
└──────────┴──────────┴──────────┴──────────────────┘
```

Grid changes from `lg:grid-cols-3` to `lg:grid-cols-4`, or Yahoo Account spans full width below — whichever fits the existing layout better. Prefer adding as a new full-width row below the existing three cards to avoid cramping.

## Error Handling

- `disconnect()` failure: silently no-op (connection status stays; user can retry)
- `/api/yahoo/status` fetch failure: `connected = false`, `loading = false` (already implemented)

## Environment Variables Required

```
YAHOO_CLIENT_ID=...
YAHOO_CLIENT_SECRET=...
VITE_APP_URL=http://localhost:5173   # or production URL
COOKIE_SECRET=<32-char random string>
```

No new env vars needed.
