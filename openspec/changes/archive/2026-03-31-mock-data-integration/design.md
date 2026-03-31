## Context

The application currently has two layers of fake data:

1. **TypeScript API layer** (`api/_shared/data.ts`): A hardcoded `samplePlayers` array of 5 players is returned by all three API handlers (`analysis`, `players`, `matchup`). `createServerSupabaseClient` exists in `src/lib/supabase.ts` and accepts `process.env` but is never called from any API handler.

2. **Python ingestion layer** (`scripts/`): All four scripts (`savant.py`, `fangraphs.py`, `mlb_stats.py`, `adp.py`) have `fetch_records()` functions that return hardcoded dicts. `scripts/utils/db.py`'s `write_rows()` only writes a local JSON file — it never calls Supabase even when credentials are present.

The current Supabase schema has 5 tables (`statcast_daily`, `injuries_and_status`, `projections`, `market_adp`, `yahoo_tokens`) but the TypeScript API needs a unified player record with hitting stats, pitching stats, Statcast metrics, and computed fields all in one row.

## Goals / Non-Goals

**Goals:**
- Add a `players` denormalized table to Supabase: one row per player, all stats the UI needs in one place
- Wire `db.py` to actually upsert to Supabase when credentials are present
- Rewrite `fangraphs.py` to fetch real batting + pitching stats via `pybaseball` and write to `players`
- Replace `samplePlayers` in `api/_shared/data.ts` with Supabase queries, with graceful fallback to mock data when Supabase is not configured
- Add `supabase-py` to `scripts/requirements.txt`

**Non-Goals:**
- Yahoo OAuth integration — `rosterState` defaults to `"waiver"` for all players
- `mlb_stats.py` and `adp.py` real data (remain as stubs with correct schema)
- `savant.py` Sprint Speed via real Statcast pull (placeholder — pybaseball Statcast is slow/large)
- `recommendationScore` and `delta` computation (computed by API from DB stats, not stored)
- Matchup opponent data — remains hardcoded until Yahoo integration

## Decisions

**Unified `players` table (denormalized)**

Rather than querying across `statcast_daily`, `projections`, and `market_adp` with JOINs, a single `players` table holds all per-player metrics. Python scripts upsert to this table. The API queries one table. This is simpler and avoids JOIN complexity for a read-heavy, write-infrequent workload.

The normalized tables (`statcast_daily`, etc.) remain unchanged — they can serve historical or audit purposes later.

**`player_id` as a text slug**

Real pybaseball data returns player names and FanGraphs IDs. For now, we generate a slug (`"firstname-lastname"` lowercased and hyphenated) as `player_id`. This matches the current mock convention and avoids a lookup table. MLBAM ID mapping can be added later.

**Fallback to `samplePlayers` when Supabase unconfigured**

When `SUPABASE_URL` or `SUPABASE_SERVICE_KEY` is missing, the API returns the existing `samplePlayers` data. This preserves the dev experience without credentials. The fallback is explicit, logged, and easy to remove later.

**`fangraphs.py` uses `pybaseball.batting_stats` / `pitching_stats`**

`pybaseball.batting_stats(season)` returns a DataFrame with AVG, OBP, HR, SB, xwOBA, Barrel%, HardHit%, K%, BB%, and more — all in a single call. `pitching_stats(season)` similarly covers ERA, WHIP, K, W, xERA, xFIP, SwStr%, CSW%. No API key required.

**API uses `createServerSupabaseClient` with `process.env`**

The existing `createServerSupabaseClient(env)` in `src/lib/supabase.ts` accepts a custom env map. In Vercel serverless functions, `process.env` is available. The handlers will pass `process.env` directly.

## Risks / Trade-offs

- [pybaseball rate-limiting] → `batting_stats` scrapes FanGraphs. Add a comment noting this and use a reasonable `qual` parameter (minimum PA/IP). Not a blocker for initial integration.
- [Column name mismatch between pybaseball and DB] → pybaseball uses "Barrel%" with percent sign as column name. The DB uses snake_case (`barrel_pct`). The Python script handles the mapping explicitly.
- [Large initial data load] → `batting_stats(2025)` returns all qualified hitters. Filter to players with PA > 50 to keep the table manageable.
- [Vercel function cold start + Supabase connection] → Supabase connection is lightweight (REST-based via JS client). Acceptable.

## Migration Plan

1. Add `players` table to `supabase/schema.sql`
2. Add `supabase-py` to `scripts/requirements.txt`
3. Implement real Supabase upsert in `scripts/utils/db.py`
4. Rewrite `scripts/fangraphs.py` to fetch real data and upsert to `players`
5. Create `api/_shared/supabase.ts` with player query functions
6. Update `api/data/analysis.ts`, `players.ts`, `matchup.ts` to use Supabase with fallback
7. Update `api/data/data.test.ts` — existing tests stay (they test the fallback/mock path)
8. Run `npm run test` and `python3 scripts/fetch_all.py --source fangraphs` to verify

Rollback: revert `api/_shared/data.ts` changes — the `samplePlayers` export stays in place for the fallback.
