## Why

The entire application runs on a hardcoded `samplePlayers` array in `api/_shared/data.ts` and all four Python ingestion scripts return static fake records. No real baseball data ever enters the system — users see the same five fictional players regardless of their league, selected categories, or date range. This is the single biggest gap blocking the product from being useful.

## What Changes

- Add `supabase-py` to `scripts/requirements.txt` so Python scripts can write to Supabase
- Implement real Supabase upsert in `scripts/utils/db.py` (currently only writes to local JSON)
- Add a `players` denormalized table to `supabase/schema.sql` holding all stats the UI requires (hitting, pitching, Statcast, computed fields)
- Rewrite `scripts/fangraphs.py` to fetch real batting and pitching stats via `pybaseball.batting_stats()` / `pybaseball.pitching_stats()` and upsert to `players`
- Rewrite `scripts/savant.py` to fetch Statcast sprint speed data via `pybaseball.statcast()` and upsert to `players`
- Replace `samplePlayers` usage in `api/_shared/data.ts` with Supabase queries using the existing `createServerSupabaseClient` from `src/lib/supabase.ts`
- Add graceful fallback to mock data when `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are not configured (dev mode)
- Update `api/data/data.test.ts` to cover both the Supabase-connected and fallback paths

## Capabilities

### New Capabilities

- `player-data-pipeline`: Python ingestion scripts that fetch real baseball stats from pybaseball (FanGraphs, Baseball Savant) and write them to the Supabase `players` table on a scheduled or manual basis
- `live-player-data`: TypeScript API layer that queries the Supabase `players` table to serve real player metrics, recommendation scores, and trend data to all five dashboard pages

### Modified Capabilities

_(none — existing API contract shape is preserved; only the data source changes)_

## Impact

**Files modified:**
- `supabase/schema.sql` — new `players` table
- `scripts/requirements.txt` + `requirements.txt` — add `supabase-py>=2.0`
- `scripts/utils/db.py` — implement real Supabase upsert
- `scripts/fangraphs.py` — real pybaseball fetch
- `scripts/savant.py` — real pybaseball Statcast fetch
- `api/_shared/data.ts` — replace `samplePlayers` with Supabase query functions
- `api/data/data.test.ts` — updated tests

**Dependencies introduced:** `supabase-py>=2.0`

**Environment variables required:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (already in `.env.example`)

**Yahoo roster state (`waiver` vs `roster`)** is not in scope — all players default to `waiver` until the Yahoo OAuth integration is complete.
