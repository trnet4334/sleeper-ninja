## 1. Schema: Add players table

- [x] 1.1 Add `players` table definition to `supabase/schema.sql` with all stat columns

## 2. Python: Real Supabase writes

- [x] 2.1 Add `supabase-py>=2.0` to `scripts/requirements.txt`
- [x] 2.2 Implement real Supabase upsert in `scripts/utils/db.py` — call `supabase.table(table).upsert(rows).execute()` when credentials are present

## 3. Python: Wire fangraphs.py to real data

- [x] 3.1 Rewrite `scripts/fangraphs.py` `fetch_records()` to call `pybaseball.batting_stats(season)` and map columns to `players` table schema
- [x] 3.2 Add pitcher stats fetch to `scripts/fangraphs.py` using `pybaseball.pitching_stats(season)`
- [x] 3.3 Change `fangraphs.run()` to write to `"players"` table instead of `"projections"`

## 4. TypeScript: Supabase query layer

- [x] 4.1 Create `api/_shared/supabase.ts` with `queryPlayersFromDb(query, supabase)` function that fetches from the `players` table and maps DB columns to the API response shape

## 5. TypeScript: Wire API handlers

- [x] 5.1 Update `api/_shared/data.ts` — add `queryPlayersWithFallback(query, rosterState?)` that tries Supabase first, falls back to `samplePlayers`
- [x] 5.2 Update `api/data/players.ts` to call `queryPlayersWithFallback`
- [x] 5.3 Update `api/data/analysis.ts` to call Supabase-aware analysis summary
- [x] 5.4 Update `api/data/matchup.ts` to call Supabase-aware matchup summary (player pickups use real data; forecast values remain computed)

## 6. Verify

- [x] 6.1 Run `npm run test` — all existing tests pass (they exercise the mock fallback path)
- [x] 6.2 Run `npm run build` — no TypeScript errors
- [x] 6.3 Run `python3 -c "from scripts.utils.db import write_rows; print(write_rows('players', []))"` — confirms dry-run JSON output without credentials
