## 1. Cookie crypto helpers in `api/_shared/yahoo.ts`

- [x] 1.1 Remove `MemoryYahooTokenStore`, `YahooTokenStore`, `memoryYahooTokenStore`, and all `tokenStore` references from `api/_shared/yahoo.ts`
- [x] 1.2 Add `encryptToken(payload: object, secret: string): Promise<string>` using `crypto.subtle` AES-256-GCM — returns `iv:authTag:ciphertext` base64url string
- [x] 1.3 Add `decryptToken(encrypted: string, secret: string): Promise<object | null>` — returns parsed payload or null on error
- [x] 1.4 Add `parseCookieToken(cookieHeader: string | null, secret: string): Promise<YahooTokenRecord | null>` — reads `yahoo_token` from cookie header, decrypts, validates expiry
- [x] 1.5 Add `YAHOO_COOKIE_NAME = "yahoo_token"` and `setCookieHeader(encrypted: string): string` helper that returns the full `Set-Cookie` header value with `httpOnly`, `secure`, `sameSite=lax`, `maxAge=2592000`, `path=/`
- [x] 1.6 Add `clearCookieHeader(): string` helper returning a `Set-Cookie` header that expires the cookie immediately (`maxAge=0`)
- [x] 1.7 Update `YahooTokenRecord` — remove `userId` field, keep `accessToken`, `refreshToken`, `expiresAt`
- [x] 1.8 Update `toTokenRecord` — remove `userId` parameter

## 2. `api/yahoo/connect.ts` — OAuth redirect initiation

- [x] 2.1 Create `api/yahoo/connect.ts` with a `handler(request, env)` function
- [x] 2.2 If `YAHOO_CLIENT_ID` / `YAHOO_CLIENT_SECRET` missing, return 500 `{ status: "missing_config" }`
- [x] 2.3 Return HTTP 302 response with `Location: <Yahoo auth URL>` using `buildYahooAuthUrl(env)`
- [x] 2.4 Delete `api/yahoo/auth.ts`

## 3. `api/yahoo/callback.ts` — Token exchange + cookie set

- [x] 3.1 Rewrite `callback.ts` — remove `userId` / `deps.tokenStore.saveToken` logic
- [x] 3.2 Exchange `code` param for tokens using real Yahoo token endpoint (`https://api.login.yahoo.com/oauth2/get_token`) with Basic Auth (`clientId:clientSecret`)
- [x] 3.3 Encrypt the token record with `encryptToken` and `process.env.COOKIE_SECRET`
- [x] 3.4 Return HTTP 302 to `/?connected=true` with `Set-Cookie` header via `setCookieHeader(encrypted)`

## 4. `api/yahoo/status.ts` — Auth state check

- [x] 4.1 Create `api/yahoo/status.ts` with a `handler(request, env)` function
- [x] 4.2 Call `parseCookieToken` on the `Cookie` request header
- [x] 4.3 Return `{ connected: true }` if valid token found, `{ connected: false }` otherwise (never 401 — this is a status check)

## 5. `api/yahoo/refresh.ts` — Background token refresh

- [x] 5.1 Create `api/yahoo/refresh.ts` with an `async handler(request, env)` function
- [x] 5.2 Read and decrypt `yahoo_token` cookie; return 401 if missing or invalid
- [x] 5.3 Call Yahoo refresh endpoint with stored `refresh_token`
- [x] 5.4 Encrypt new token and return response with updated `Set-Cookie` header and `{ status: "refreshed" }`

## 6. `api/yahoo/disconnect.ts` — Clear cookie

- [x] 6.1 Create `api/yahoo/disconnect.ts` with a `handler()` function
- [x] 6.2 Return response with `Set-Cookie: clearCookieHeader()` and `{ status: "disconnected" }`

## 7. `api/yahoo/transactions.ts` — League transactions

- [x] 7.1 Create `api/yahoo/transactions.ts` with an `async handler(request, env)` function
- [x] 7.2 Read `league_id` from query param; return 400 if missing
- [x] 7.3 Read and decrypt cookie token; return 401 if missing/invalid; refresh if expired
- [x] 7.4 Return stub `{ status: "ok", leagueId, transactions: [] }` (real Yahoo API call is a follow-up integration task)

## 8. Update existing Yahoo routes

- [x] 8.1 Rewrite `api/yahoo/roster.ts` — remove `userId` / `user_id` param; read token from cookie using `parseCookieToken`; return 401 if missing; refresh if expired
- [x] 8.2 Rewrite `api/yahoo/matchup.ts` — same cookie auth pattern as roster

## 9. Supabase schema cleanup

- [x] 9.1 Remove `yahoo_tokens` table definition from `supabase/schema.sql`

## 10. Frontend: `useYahooAuth` hook

- [x] 10.1 Create `src/hooks/useYahooAuth.ts` — calls `GET /api/yahoo/status` on mount, returns `{ connected: boolean, loading: boolean }`

## 11. Frontend: `YahooConnectBanner` component

- [x] 11.1 Create `src/components/auth/YahooConnectBanner.tsx` — renders an amber banner with a Connect button (`<a href="/api/yahoo/connect">`) when `!connected && !loading`
- [x] 11.2 Wire `useYahooAuth` into `AppShell.tsx` and render `<YahooConnectBanner />` at the top of the page content area

## 12. Tests and env

- [x] 12.1 Update `api/yahoo/yahoo.test.ts` — add tests for `status`, `disconnect`, `transactions` handlers; remove `userId` param from existing test calls
- [x] 12.2 Add `COOKIE_SECRET` to `.env.example` with a placeholder comment
- [x] 12.3 Run `npm run test` — all tests pass
- [x] 12.4 Run `npm run build` — no errors
- [x] 12.5 Run `npm run lint` — no errors
