## Why

The current Supabase schema uses a single flat `players` table that mixes hitter and pitcher stats into one row, with many nullable columns and no `days_back` dimension. This made sense as a quick mock-data target, but it can't support the v4 data model: Statcast data is time-windowed (7d/14d/30d), projections (Steamer) are structurally different from Statcast signals, ADP is a separate dimension, and injuries need a one-to-many model. The Python ingestion scripts also need distinct write targets to avoid column collisions between hitters and pitchers.

## What Changes

- **BREAKING** Replace the flat `players` table with four typed source tables: `statcast_batters`, `statcast_pitchers`, `projections`, `adp`
- **BREAKING** Replace `injuries_and_status` (single-row-per-player) with `injuries` (multi-row, event-based)
- Replace `statcast_daily` (old minimal table) with proper `statcast_batters` / `statcast_pitchers` schema
- Replace `market_adp` (old table) with `adp` table matching v4 schema
- Update `projections` table to include full Steamer projection columns (currently only has `hr`, `sb`, `k`, `era`)
- Update `scripts/fangraphs.py` to write to `statcast_batters` and `statcast_pitchers` (split by player type, using MLBAM ID as primary key)
- Update `api/_shared/supabase.ts` to query `statcast_batters` or `statcast_pitchers` based on `playerType`, replacing the `players` table query
- Keep the flat `players` table in schema for backwards compatibility during transition, but stop writing to it from Python scripts
- Add `days_back` column to both Statcast tables for time-window filtering

## Capabilities

### New Capabilities

- `supabase-v4-schema`: Four normalized source tables (`statcast_batters`, `statcast_pitchers`, `projections`, `adp`, `injuries`) replacing the flat denormalized `players` table

### Modified Capabilities

- `baseball-data-pipeline`: Python ingestion writes to split `statcast_batters` / `statcast_pitchers` tables instead of a unified `players` table; supports `days_back` parameter in writes

## Impact

- `supabase/schema.sql` — add v4 tables, deprecate old tables
- `scripts/fangraphs.py` — rewrite write targets to `statcast_batters` / `statcast_pitchers`
- `api/_shared/supabase.ts` — query split tables, build mapping from both hitter and pitcher columns
- `api/_shared/data.ts` — no changes required (uses supabase.ts abstraction)
- Old tables (`statcast_daily`, `injuries_and_status`, `market_adp`) marked deprecated in schema comments
