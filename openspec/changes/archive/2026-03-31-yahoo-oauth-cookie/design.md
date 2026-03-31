## Context

The current Yahoo OAuth flow uses a `user_id` query parameter to key tokens into a `MemoryYahooTokenStore` (in-memory map). This is incompatible with Vercel's serverless runtime — each function invocation gets a fresh process, so the in-memory store is always empty in production. Token was also stored in a `yahoo_tokens` Supabase table via `deps.tokenStore.saveToken()`, but this design introduced a server-side user identity concept that the v4 architecture explicitly removes.

v4 design principle: **no user accounts**. Each browser holds its own encrypted Yahoo token in an `httpOnly` cookie. All API routes read the token directly from the request cookie. The server never stores tokens.

## Goals / Non-Goals

**Goals:**
- Replace in-memory/DB token store with `httpOnly` AES-256-GCM encrypted cookie
- Redirect-based connect/callback flow (not JSON `authUrl` response)
- All Yahoo API routes read cookie token, no `user_id` param
- Add `transactions` and `disconnect` endpoints
- Frontend banner + hook for auth state detection
- Stateless: server holds no Yahoo credentials

**Non-Goals:**
- Multi-user sessions or user accounts
- Server-side token revocation
- Yahoo scope expansion beyond `fspt-r` (Fantasy Sports read)
- Rate limiting or caching Yahoo API responses (future concern)

## Decisions

### Decision: AES-256-GCM for cookie encryption, not JWT

The token stored in the cookie contains a Yahoo `access_token` and `refresh_token`. We need confidentiality (prevent client from reading the raw tokens) and integrity (prevent tampering).

- AES-256-GCM provides authenticated encryption — both confidentiality and integrity in one primitive.
- JWT (HS256) provides integrity but not confidentiality by default.
- Using Node's built-in `crypto.subtle` (Web Crypto API, available in Vercel Edge/Node runtimes) avoids adding an npm dependency.

Cookie format: `iv:authTag:ciphertext` — all base64url, colon-delimited. Key derived from `COOKIE_SECRET` env var via `subtle.importKey`.

### Decision: `cookie` npm package for serialization, `cookie` header parsing for reading

Vercel API Routes (Node.js) don't have a built-in cookie parser. We use:
- `cookie` package (already a common Vercel dependency) for `serialize()` in responses
- Manual `req.headers.cookie` parsing via the same `cookie.parse()` for reading

This keeps the dependency surface minimal.

### Decision: `connect.ts` replaces `auth.ts` with a 302 redirect

The old `auth.ts` returned `{ authUrl }` as JSON and expected the frontend to do `window.location.href = authUrl`. This is a two-round-trip pattern that requires JS to be loaded and running. A direct 302 redirect from `/api/yahoo/connect` works from a plain `<a href>` or `router.push`, requires no JS, and is the standard OAuth initiation pattern.

### Decision: Callback redirects to `/?connected=true`, not to a JSON response

After setting the cookie, `callback.ts` redirects to the Dashboard root. The frontend detects the cookie via a `/api/yahoo/status` ping on mount. Avoids the frontend needing to handle a callback page with special URL params.

### Decision: Remove `yahoo_tokens` Supabase table

Tokens live in browser cookies — persisting them server-side creates redundancy and a security surface. The table is dropped from `schema.sql`. Existing rows (if any) become orphaned and can be dropped.

## Risks / Trade-offs

- **Cookie cleared by user → re-auth required** — expected behavior; the banner guides re-auth. Mitigation: 30-day maxAge reduces frequency.
- **`COOKIE_SECRET` rotation invalidates all existing cookies** — all users must re-connect after secret rotation. Mitigation: document this, make rotation deliberate.
- **Token refresh race condition** — if two tabs call a Yahoo route simultaneously and both find an expired token, both will attempt refresh. Mitigation: the last write wins (both set the same new cookie); Yahoo's refresh token rotation means the first-to-complete wins and the second attempt may fail. Acceptable for a small-team tool — add a lock only if needed.
- **AES-GCM nonce reuse** — we use `crypto.getRandomValues(12-byte nonce)` per encryption, making collision probability negligible (~2^-96 for 2^32 encryptions).

## Migration Plan

1. Add `COOKIE_SECRET` to `.env.local` and Vercel env vars
2. Deploy new routes (`connect`, `callback` rewrite, `refresh`, `transactions`, `disconnect`, `status`)
3. Remove `api/yahoo/auth.ts`
4. Update frontend to use `/api/yahoo/connect` redirect and `useYahooAuth` hook
5. Run `ALTER TABLE` / drop `yahoo_tokens` in Supabase SQL editor after confirming no active tokens are needed

**Rollback:** Revert `callback.ts` to old implementation, restore `auth.ts`, re-add `MemoryYahooTokenStore`. No data migration needed since the old store was in-memory anyway.

## Open Questions

- Should `/api/yahoo/status` return the Yahoo GUID/screen name to display in the UI (e.g. "Connected as @stevy")? Not required for v4 but could improve UX. Deferring.
- Should `transactions.ts` accept a `count` parameter to limit how many transactions are returned? Default to 25, add param if needed after integration.
