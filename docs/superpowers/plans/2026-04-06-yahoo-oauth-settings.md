# Yahoo OAuth Settings Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Yahoo OAuth connect/disconnect into the Settings page, auto-sync Yahoo leagues into LeagueManager, and gate Matchup Analysis behind OAuth.

**Architecture:** Backend `/api/yahoo/leagues` endpoint fetches user leagues from Yahoo's Fantasy API and returns them as `LeagueDefinition[]`. A new `useYahooLeagues` hook fetches this when connected. `useYahooAuth` gains a `disconnect()` method. The H2HMatchup page renders a connect prompt when `connected=false`.

**Tech Stack:** React, TypeScript, Vitest, @testing-library/react, fetch (Web API), Yahoo Fantasy Sports API v2

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/hooks/useYahooAuth.ts` | Add `disconnect()` method |
| Create | `api/yahoo/leagues.ts` | Fetch user's Yahoo MLB leagues |
| Modify | `api/yahoo/yahoo.test.ts` | Add leagues endpoint tests |
| Create | `src/hooks/useYahooLeagues.ts` | Fetch Yahoo leagues when connected |
| Create | `src/components/settings/YahooAccountPanel.tsx` | Connect/disconnect UI card |
| Modify | `src/pages/Settings.tsx` | Add YahooAccountPanel |
| Modify | `src/components/settings/LeagueManager.tsx` | Show Yahoo leagues when connected |
| Modify | `src/pages/H2HMatchup.tsx` | Auth gate + connect prompt |
| Modify | `src/pages/pages.test.tsx` | Update matchup test for auth gate |

---

### Task 1: Add `disconnect()` to `useYahooAuth`

**Files:**
- Modify: `src/hooks/useYahooAuth.ts`

- [ ] **Step 1: Rewrite `useYahooAuth.ts` to add `disconnect()`**

Replace the entire file:

```typescript
import { useCallback, useEffect, useState } from "react";

export interface YahooAuthState {
  connected: boolean;
  loading: boolean;
  disconnect: () => Promise<void>;
}

export function useYahooAuth(): YahooAuthState {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/yahoo/status");
        const payload = (await response.json()) as { connected: boolean };
        if (!cancelled) {
          setConnected(payload.connected);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
          setLoading(false);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const response = await fetch("/api/yahoo/disconnect", { method: "POST" });
      if (response.ok) {
        setConnected(false);
      }
    } catch {
      // no-op: leave state unchanged
    }
  }, []);

  return { connected, loading, disconnect };
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useYahooAuth.ts
git commit -m "feat: add disconnect() to useYahooAuth"
```

---

### Task 2: Create `api/yahoo/leagues.ts`

**Files:**
- Create: `api/yahoo/leagues.ts`

The Yahoo Fantasy Sports API returns a deeply-nested alternating array/object structure. We parse it safely with a dedicated helper.

- [ ] **Step 1: Create `api/yahoo/leagues.ts`**

```typescript
import { json } from "../_shared/http";
import {
  encryptToken,
  isTokenExpired,
  parseCookieToken,
  readYahooEnv,
  setCookieHeader,
  toTokenRecord,
  type YahooOAuthExchangeResult
} from "../_shared/yahoo";

interface LeagueResult {
  id: string;
  name: string;
  yahooLeagueId: string;
  season: number;
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function parseYahooLeagues(data: unknown): LeagueResult[] {
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    const users = (fc as Record<string, unknown>)?.users;
    const userEntry = (users as Record<string, unknown>)?.["0"]?.user;
    if (!Array.isArray(userEntry) || userEntry.length < 2) return [];

    const games = (userEntry[1] as Record<string, unknown>)?.games;
    const gameEntry = (games as Record<string, unknown>)?.["0"]?.game;
    if (!Array.isArray(gameEntry) || gameEntry.length < 2) return [];

    const leaguesObj = (gameEntry[1] as Record<string, unknown>)?.leagues;
    if (!leaguesObj || typeof leaguesObj !== "object") return [];

    const count = Number((leaguesObj as Record<string, unknown>)?.count ?? 0);
    const results: LeagueResult[] = [];

    for (let i = 0; i < count; i++) {
      const entry = (leaguesObj as Record<string, unknown>)[String(i)];
      const leagueArr = (entry as Record<string, unknown>)?.league;
      if (!Array.isArray(leagueArr) || leagueArr.length === 0) continue;

      const meta = leagueArr[0] as Record<string, string>;
      if (!meta.league_id || !meta.name) continue;

      results.push({
        id: slugify(meta.name),
        name: meta.name,
        yahooLeagueId: meta.league_id,
        season: parseInt(meta.season ?? "2025", 10)
      });
    }

    return results;
  } catch {
    return [];
  }
}

async function refreshYahooToken(
  refreshToken: string,
  env: Record<string, string | undefined>
): Promise<YahooOAuthExchangeResult> {
  const config = readYahooEnv(env);
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!response.ok) throw new Error("refresh_failed");
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}

async function fetchYahooLeagues(accessToken: string): Promise<LeagueResult[]> {
  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues?format=json";
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Yahoo leagues fetch failed: ${response.status}`);
  const data = await response.json();
  return parseYahooLeagues(data);
}

export async function handler(
  request: Request,
  env: Record<string, string | undefined> = process.env
): Promise<Response> {
  const cookieSecret = env.COOKIE_SECRET ?? "";
  let token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) {
    return json({ status: "unauthorized" }, { status: 401 });
  }

  if (isTokenExpired(token)) {
    try {
      const refreshed = await refreshYahooToken(token.refreshToken, env);
      token = toTokenRecord(refreshed);
      const encrypted = await encryptToken(token, cookieSecret);
      const leagues = await fetchYahooLeagues(token.accessToken);
      return new Response(JSON.stringify({ status: "ok", leagues }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": setCookieHeader(encrypted)
        }
      });
    } catch {
      return json({ status: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const leagues = await fetchYahooLeagues(token.accessToken);
    return json({ status: "ok", leagues });
  } catch {
    return json({ status: "fetch_failed" }, { status: 502 });
  }
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add api/yahoo/leagues.ts
git commit -m "feat: add GET /api/yahoo/leagues endpoint"
```

---

### Task 3: Test `api/yahoo/leagues.ts`

**Files:**
- Modify: `api/yahoo/yahoo.test.ts`

- [ ] **Step 1: Add import and test suite to `yahoo.test.ts`**

Add at the top of the imports section:

```typescript
import { handler as leaguesHandler, parseYahooLeagues } from "./leagues";
```

Add the following test suite at the end of the file, after the `matchup` describe block:

```typescript
describe("parseYahooLeagues", () => {
  it("returns empty array for unexpected shape", () => {
    expect(parseYahooLeagues(null)).toEqual([]);
    expect(parseYahooLeagues({})).toEqual([]);
    expect(parseYahooLeagues({ fantasy_content: {} })).toEqual([]);
  });

  it("parses a single league from Yahoo response", () => {
    const fixture = {
      fantasy_content: {
        users: {
          "0": {
            user: [
              { guid: "abc" },
              {
                games: {
                  "0": {
                    game: [
                      { game_key: "mlb" },
                      {
                        leagues: {
                          "0": {
                            league: [
                              { league_id: "12345", name: "My League", season: "2025" }
                            ]
                          },
                          count: 1
                        }
                      }
                    ]
                  },
                  count: 1
                }
              }
            ]
          },
          count: 1
        }
      }
    };
    const result = parseYahooLeagues(fixture);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "my_league",
      name: "My League",
      yahooLeagueId: "12345",
      season: 2025
    });
  });
});

describe("leagues", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when no cookie present", async () => {
    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues"),
      env
    );
    expect(response.status).toBe(401);
  });

  it("returns leagues array when valid cookie present", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    const fixture = {
      fantasy_content: {
        users: {
          "0": {
            user: [
              { guid: "abc" },
              {
                games: {
                  "0": {
                    game: [
                      { game_key: "mlb" },
                      {
                        leagues: {
                          "0": {
                            league: [
                              { league_id: "99999", name: "Test League", season: "2025" }
                            ]
                          },
                          count: 1
                        }
                      }
                    ]
                  },
                  count: 1
                }
              }
            ]
          },
          count: 1
        }
      }
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.leagues).toHaveLength(1);
    expect(payload.leagues[0].yahooLeagueId).toBe("99999");
    expect(payload.leagues[0].name).toBe("Test League");
  });

  it("returns 502 when Yahoo API fails", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("error", { status: 500 })
    );

    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    expect(response.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npx vitest run api/yahoo/yahoo.test.ts
```

Expected: all tests pass, including the new `parseYahooLeagues` and `leagues` suites.

- [ ] **Step 3: Commit**

```bash
git add api/yahoo/yahoo.test.ts
git commit -m "test: add leagues endpoint and parser tests"
```

---

### Task 4: Create `useYahooLeagues` hook

**Files:**
- Create: `src/hooks/useYahooLeagues.ts`

- [ ] **Step 1: Create the hook**

```typescript
import { useEffect, useState } from "react";
import type { LeagueDefinition } from "@/types/league";

export function useYahooLeagues(enabled: boolean): {
  leagues: LeagueDefinition[];
  loading: boolean;
} {
  const [leagues, setLeagues] = useState<LeagueDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const response = await fetch("/api/yahoo/leagues");
        if (!response.ok) {
          if (!cancelled) { setLeagues([]); setLoading(false); }
          return;
        }
        const payload = (await response.json()) as { leagues: LeagueDefinition[] };
        if (!cancelled) {
          setLeagues(payload.leagues ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setLeagues([]); setLoading(false); }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [enabled]);

  return { leagues, loading };
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useYahooLeagues.ts
git commit -m "feat: add useYahooLeagues hook"
```

---

### Task 5: Create `YahooAccountPanel` component

**Files:**
- Create: `src/components/settings/YahooAccountPanel.tsx`

- [ ] **Step 1: Create the component**

```typescript
export function YahooAccountPanel({
  connected,
  loading,
  onDisconnect,
}: {
  connected: boolean;
  loading: boolean;
  onDisconnect: () => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-surface-container-high" />
      </div>
    );
  }

  if (connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-semibold text-on-surface">Connected</span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Your Yahoo Fantasy account is linked. League data syncs automatically.
        </p>
        <button
          type="button"
          onClick={onDisconnect}
          className="w-full rounded-lg border border-error/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-error transition-colors hover:bg-error/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-on-surface-variant/30" />
        <span className="text-sm font-semibold text-on-surface-variant">Not connected</span>
      </div>
      <p className="text-xs text-on-surface-variant">
        Connect your Yahoo Fantasy account to sync leagues and unlock Matchup Analysis.
      </p>
      <a
        href="/api/yahoo/connect"
        className="block w-full rounded-lg bg-amber-500 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
      >
        Connect Yahoo Fantasy
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/YahooAccountPanel.tsx
git commit -m "feat: add YahooAccountPanel settings component"
```

---

### Task 6: Update `Settings.tsx` to include Yahoo Account panel

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Rewrite `Settings.tsx`**

```typescript
import { useYahooAuth } from "@/hooks/useYahooAuth";
import { LeagueManager } from "@/components/settings/LeagueManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { StatPreferencesPanel } from "@/components/settings/StatPreferences";
import { YahooAccountPanel } from "@/components/settings/YahooAccountPanel";

export function SettingsPage() {
  const { connected, loading, disconnect } = useYahooAuth();

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Settings
        </h1>
        <p className="mt-1 font-medium text-on-surface-variant">
          Manage your <span className="font-bold text-primary">leagues, categories, and preferences</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Leagues</h2>
          <LeagueManager connected={connected} />
        </div>

        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Categories</h2>
          <CategoryManager />
        </div>

        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Preferences</h2>
          <StatPreferencesPanel />
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low p-6">
        <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Yahoo Account</h2>
        <div className="max-w-sm">
          <YahooAccountPanel
            connected={connected}
            loading={loading}
            onDisconnect={disconnect}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: error about `LeagueManager` not accepting `connected` prop — this is expected, fixed in next task.

- [ ] **Step 3: Commit (after Task 7 fixes the TypeScript error)**

Hold this commit — proceed to Task 7 first.

---

### Task 7: Update `LeagueManager` to show Yahoo leagues when connected

**Files:**
- Modify: `src/components/settings/LeagueManager.tsx`

- [ ] **Step 1: Rewrite `LeagueManager.tsx`**

```typescript
import { useState } from "react";
import { useLeagues } from "@/hooks/useLeagues";
import { useYahooLeagues } from "@/hooks/useYahooLeagues";

export function LeagueManager({ connected }: { connected: boolean }) {
  const { leagues, addLeague, removeLeague } = useLeagues();
  const { leagues: yahooLeagues, loading: yahooLoading } = useYahooLeagues(connected);
  const [name, setName] = useState("");
  const [yahooLeagueId, setYahooLeagueId] = useState("");

  // Deduplicate: Yahoo leagues take priority; hide manual entries with same yahooLeagueId
  const manualLeagues = leagues.filter(
    (l) => !yahooLeagues.some((y) => y.yahooLeagueId === l.yahooLeagueId)
  );

  return (
    <div className="space-y-4">
      {/* Yahoo-synced leagues */}
      {connected && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
            From Yahoo
          </p>
          {yahooLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-high" />
              ))}
            </div>
          ) : yahooLeagues.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No Yahoo leagues found.</p>
          ) : (
            <div className="space-y-2">
              {yahooLeagues.map((league) => (
                <div
                  key={league.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{league.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{league.yahooLeagueId}</p>
                  </div>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary">
                    Yahoo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manually-added leagues */}
      {manualLeagues.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
            {connected ? "Manual" : "Leagues"}
          </p>
          <div className="space-y-2">
            {manualLeagues.map((league) => (
              <div
                key={league.id}
                className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">{league.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{league.yahooLeagueId}</p>
                </div>
                {leagues.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeLeague(league.id)}
                    className="text-xs text-primary"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual add form */}
      <div className="space-y-2 border-t border-white/5 pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
          Add manually
        </p>
        <label htmlFor="league-name" className="sr-only">New league name</label>
        <input
          id="league-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New league name"
          className="w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant"
        />
        <label htmlFor="league-yahoo-id" className="sr-only">Yahoo league ID</label>
        <input
          id="league-yahoo-id"
          value={yahooLeagueId}
          onChange={(event) => setYahooLeagueId(event.target.value)}
          placeholder="Yahoo league ID"
          className="w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant"
        />
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !yahooLeagueId.trim()) return;
            addLeague({
              id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
              name: name.trim(),
              yahooLeagueId: yahooLeagueId.trim(),
              season: 2025
            });
            setName("");
            setYahooLeagueId("");
          }}
          className="w-full rounded-xl bg-primary-container px-3 py-2 text-sm font-semibold text-on-primary-container"
        >
          Add league
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit Tasks 6 + 7 together**

```bash
git add src/pages/Settings.tsx src/components/settings/LeagueManager.tsx src/hooks/useYahooLeagues.ts
git commit -m "feat: add Yahoo Account panel and league sync to Settings"
```

---

### Task 8: Add auth gate to `H2HMatchup`

**Files:**
- Modify: `src/pages/H2HMatchup.tsx`

- [ ] **Step 1: Add auth gate to `H2HMatchup.tsx`**

At the top of the file, add the import:

```typescript
import { useYahooAuth } from "@/hooks/useYahooAuth";
```

Inside `H2HMatchupPage`, add at the top of the function body (before the existing hooks):

```typescript
const { connected, loading: authLoading } = useYahooAuth();
```

Then add a gate immediately before the `return (` statement:

```typescript
if (!connected && !authLoading) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-sm rounded-xl bg-surface-container-low p-8 text-center">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Matchup Analysis
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Connect your Yahoo Fantasy account to view your head-to-head matchup data.
        </p>
        <a
          href="/api/yahoo/connect"
          className="mt-6 block rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
        >
          Connect Yahoo Fantasy
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/H2HMatchup.tsx
git commit -m "feat: gate Matchup Analysis behind Yahoo OAuth"
```

---

### Task 9: Update `pages.test.tsx` for matchup auth gate

**Files:**
- Modify: `src/pages/pages.test.tsx`

The matchup test currently passes because `useYahooAuth` calls `fetch("/api/yahoo/status")` which fails silently (no mock), setting `connected=false`, `loading=false`. After the gate is added, this renders the connect prompt instead of the matchup content — so "Ninja Insight" will no longer be found.

- [ ] **Step 1: Add fetch mock for matchup test in `pages.test.tsx`**

Add a `beforeEach` to the matchup test that mocks fetch to return `connected: true`:

Replace the existing matchup test:

```typescript
it("renders matchup page with ninja insight and roster columns", async () => {
  wrap(<H2HMatchupPage />);
  expect(await screen.findByText("Ninja Insight")).toBeInTheDocument();
  expect(await screen.findByText("My Roster")).toBeInTheDocument();
});
```

With:

```typescript
it("renders matchup page with ninja insight and roster columns when connected", async () => {
  vi.spyOn(global, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    if (url.includes("/api/yahoo/status")) {
      return Promise.resolve(
        new Response(JSON.stringify({ connected: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });

  wrap(<H2HMatchupPage />);
  expect(await screen.findByText("Ninja Insight")).toBeInTheDocument();
  expect(await screen.findByText("My Roster")).toBeInTheDocument();
});

it("renders matchup connect prompt when not connected", async () => {
  vi.spyOn(global, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    if (url.includes("/api/yahoo/status")) {
      return Promise.resolve(
        new Response(JSON.stringify({ connected: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });

  wrap(<H2HMatchupPage />);
  expect(await screen.findByText("Connect Yahoo Fantasy")).toBeInTheDocument();
});
```

Also add at the top of the `pages.test.tsx` file:

```typescript
import { vi, afterEach } from "vitest";
```

And add inside the `describe` block before the tests:

```typescript
afterEach(() => {
  vi.restoreAllMocks();
});
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/pages.test.tsx
git commit -m "test: update matchup page tests for Yahoo OAuth gate"
```

---

## Self-Review

**Spec coverage:**
- ✅ Banner behavior: no change needed (already correct) — not in plan
- ✅ `disconnect()` on `useYahooAuth` — Task 1
- ✅ `GET /api/yahoo/leagues` endpoint — Task 2
- ✅ Leagues endpoint tests — Task 3
- ✅ `useYahooLeagues` hook — Task 4
- ✅ `YahooAccountPanel` component — Task 5
- ✅ Settings page Yahoo Account row — Task 6
- ✅ LeagueManager Yahoo sync + manual add preserved — Task 7
- ✅ H2HMatchup auth gate + connect prompt — Task 8
- ✅ pages.test.tsx updated — Task 9

**Placeholder scan:** No TBD, TODO, or vague steps found.

**Type consistency:**
- `useYahooAuth` returns `{ connected, loading, disconnect }` — used identically in Tasks 6, 8
- `useYahooLeagues(enabled: boolean)` returns `{ leagues, loading }` — used identically in Task 7
- `YahooAccountPanel` props `{ connected, loading, onDisconnect }` — passed identically in Task 6
- `LeagueManager` gains `{ connected: boolean }` prop — passed in Task 6, defined in Task 7
- `LeagueResult` in `api/yahoo/leagues.ts` matches shape of `LeagueDefinition` in `src/types/league.ts` — compatible
