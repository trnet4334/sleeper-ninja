## Why

The current Yahoo OAuth implementation stores tokens in a server-side in-memory store keyed by a `user_id` query parameter — this is both insecure and incompatible with Vercel's stateless serverless runtime where memory is not shared across invocations. The v4 architecture removes the user account concept entirely and stores the encrypted Yahoo token in a browser-side `httpOnly` cookie, which is the standard stateless pattern for OAuth without a backend auth system.

## What Changes

- **BREAKING** Replace `api/yahoo/auth.ts` (returns JSON `authUrl`) with `api/yahoo/connect.ts` (HTTP 302 redirect to Yahoo)
- **BREAKING** Rewrite `api/yahoo/callback.ts` — instead of saving to `yahoo_tokens` table, encrypt token and set `httpOnly` cookie, then redirect to Dashboard
- **BREAKING** Remove `userId` / `user_id` parameter from all Yahoo API routes — token is now read from cookie on each request
- **BREAKING** Remove `MemoryYahooTokenStore`, `YahooTokenStore`, `memoryYahooTokenStore` from `api/_shared/yahoo.ts`
- Add `api/yahoo/refresh.ts` — background token refresh, updates cookie in-place
- Add `api/yahoo/transactions.ts` — returns recent league transactions using cookie token
- Add `api/yahoo/disconnect.ts` — clears the cookie
- Update `api/yahoo/roster.ts` and `api/yahoo/matchup.ts` — read token from cookie, no `userId` param
- Add `COOKIE_SECRET` env var for AES-256-GCM token encryption
- Drop `yahoo_tokens` Supabase table from schema (tokens no longer persisted server-side)
- Add frontend `useYahooAuth` hook — checks `/api/yahoo/status` to detect cookie presence
- Add `YahooConnectBanner` component — shown when no valid cookie detected

## Capabilities

### New Capabilities

- `yahoo-cookie-auth`: httpOnly cookie-based OAuth flow — connect, callback with encrypted cookie, refresh, disconnect, and status check endpoints
- `yahoo-connect-banner`: Frontend detection of auth state and guided connect prompt for unauthenticated users

### Modified Capabilities

- `yahoo-fantasy-sync`: Token acquisition changes from stored-credential model to cookie model; `user_id` param removed from all endpoints; roster/matchup/transactions routes now read cookie instead of querying `yahoo_tokens` table

## Impact

- `api/yahoo/auth.ts` — replaced by `connect.ts`
- `api/yahoo/callback.ts` — full rewrite
- `api/yahoo/roster.ts` — remove `userId` param, read cookie
- `api/yahoo/matchup.ts` — remove `userId` param, read cookie
- `api/_shared/yahoo.ts` — remove token store, add cookie encrypt/decrypt helpers
- `supabase/schema.sql` — remove `yahoo_tokens` table
- New files: `api/yahoo/connect.ts`, `api/yahoo/refresh.ts`, `api/yahoo/transactions.ts`, `api/yahoo/disconnect.ts`, `api/yahoo/status.ts`
- New files: `src/hooks/useYahooAuth.ts`, `src/components/auth/YahooConnectBanner.tsx`
- New env vars: `COOKIE_SECRET` (32-char random string for AES-GCM encryption)
- Test updates: `api/yahoo/yahoo.test.ts`
