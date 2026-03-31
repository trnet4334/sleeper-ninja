## Context

The current schema has two generations of tables coexisting:
- **Gen 1** (old): `statcast_daily` (minimal columns), `injuries_and_status` (single-row), `market_adp`, `projections` (4 columns)
- **Gen 2** (mock-data-integration): `players` (flat unified snapshot for API reads)

Neither matches the v4 data model. The v4 architecture splits data by source and type:
- `statcast_batters` / `statcast_pitchers` — Statcast metrics per player per time window (from Baseball Savant via `pybaseball`)
- `projections` — Full Steamer season projections (from FanGraphs via `pybaseball`)
- `adp` — Average Draft Position (from NFBC/FanGraphs)
- `injuries` — Active IL placements (event-based, not single-row per player)

The API read layer (`api/_shared/supabase.ts`) currently queries `players.*`. After this change it will query `statcast_batters` or `statcast_pitchers` depending on `playerType`, with a column mapping update to match the new schema.

## Goals / Non-Goals

**Goals:**
- Add v4 source tables with full column sets matching the `architecture_v4.md` schema
- Update Python `fangraphs.py` to write to split tables using MLBAM ID as primary key
- Update TypeScript `supabase.ts` to read from split tables
- Support `days_back` filtering (7/14/30) in Statcast queries

**Non-Goals:**
- Materializing a joined view in Supabase (joins happen in frontend `lib/analysis.ts`)
- Migrating existing rows from `players` to the new tables (data will be repopulated by the next GitHub Actions run)
- Dropping old tables immediately (kept as deprecated, drop in a follow-up cleanup)

## Decisions

### Decision: Separate `statcast_batters` and `statcast_pitchers` tables, not a unified `players` table

Hitter and pitcher metrics are almost entirely disjoint. A unified table requires 25+ nullable columns per row, which is noise in every query and makes schema evolution painful. Separate tables:
- Allow independent indexing (e.g., `days_back` index on each)
- Make the schema self-documenting
- Avoid nullable column sprawl

The tradeoff is that the API layer needs to select the right table based on `playerType` — a one-line conditional, not a meaningful complexity increase.

### Decision: `days_back` as a column, not a separate table per window

Storing all time windows in one table with a `days_back` column allows a single upsert per `(player_id, days_back)` composite key. Alternative (separate table per window) multiplies table count for no gain. Query: `WHERE days_back = 14`.

Primary key changes from `player_id TEXT PRIMARY KEY` to `(player_id TEXT, days_back INT)` composite.

### Decision: Keep flat `players` table but stop writing to it

The `players` table is referenced in `queryPlayersFromDb` in supabase.ts. Dropping it immediately would break the fallback. We update supabase.ts to query the new tables and leave `players` in place (commented as deprecated) until a cleanup pass removes it.

### Decision: `projections` and `adp` keep single-row-per-player (TEXT PRIMARY KEY)

Projections are per-season and ADP is a single ranking — no time-window dimension. `(player_id, season)` composite for projections is cleaner but adds query complexity for no current benefit. Using `player_id` TEXT PK means the upsert replaces the row, which is the desired behavior for daily refreshes.

### Decision: `injuries` is event-based (no primary key on `player_id`)

A player can be placed on and return from the IL multiple times in a season. Using `player_id` as PK (as in the old `injuries_and_status`) would overwrite earlier events. Using a composite `(player_id, date)` PK or a surrogate `id SERIAL` allows historical tracking. We use `(player_id, date)` composite PK for simplicity.

## Risks / Trade-offs

- **Python MLBAM ID lookup** — `pybaseball` returns MLBAM IDs in `batting_stats_bref`/`statcast_batter_exitvelo` but not always in `batting_stats()` (FanGraphs). We use FanGraphs player IDs with a `IDfg` → `MLBAMID` cross-reference from `pybaseball.playerid_reverse_lookup()`. Risk: occasional lookup failures for minor players. Mitigation: log misses, skip rather than fail.
- **Supabase free tier row limits** — 5M rows on free tier. With ~1000 players × 3 windows × 2 tables = ~6000 rows per day. Well within limits.
- **TypeScript column mapping update** — `DB_TO_METRIC` in `supabase.ts` maps column names to display keys. The new tables use slightly different column names (e.g., `xwoba_against` for pitchers vs `xwoba` for hitters). The mapping needs a hitter-specific and pitcher-specific section.

## Migration Plan

1. Run schema SQL in Supabase SQL editor to add new tables
2. Deploy updated `fangraphs.py` that writes to new tables
3. Trigger manual `fetch_all.py` run to populate new tables
4. Deploy updated `supabase.ts` that reads from new tables
5. Verify data flows end-to-end in staging
6. In a follow-up: drop old tables (`statcast_daily`, `injuries_and_status`, `market_adp`)

**Rollback:** Revert `supabase.ts` to query `players` table — data is still there. Revert `fangraphs.py` to write to `players`.

## Open Questions

- Should `statcast_batters` include traditional stats (AVG, HR, RBI) or only Statcast metrics? v4 schema includes both — keeping both avoids needing to join `projections` for every query.
- Should the API expose a `days_back` query param to let the frontend choose the time window? Currently hardcoded to 14 — add as `daysBack` param (already in `DataQuery`) in a follow-up.
