## 1. Supabase schema — add v4 tables

- [x] 1.1 Add `statcast_batters` table to `supabase/schema.sql` with composite PK `(player_id TEXT, days_back INT)`, columns: `player_name`, `team`, `position`, `pa`, `xba`, `xslg`, `xwoba`, `barrel_pct`, `hard_hit_pct`, `ev_avg`, `sprint_speed`, `avg`, `obp`, `hr`, `sb`, `tb`, `bb`, `updated_at`
- [x] 1.2 Add `statcast_pitchers` table to `supabase/schema.sql` with composite PK `(player_id TEXT, days_back INT)`, columns: `player_name`, `team`, `role` (SP/RP/CL), `ip`, `era`, `whip`, `xera`, `xfip`, `xwoba_against`, `swstr_pct`, `csw_pct`, `k_pct`, `bb_pct`, `k`, `w`, `sv`, `hld`, `updated_at`
- [x] 1.3 Update `projections` table in `supabase/schema.sql` to include full Steamer columns: `pa`, `hr`, `r`, `rbi`, `sb`, `avg`, `obp`, `slg`, `tb`, `bb` (hitting) and `w`, `sv`, `k`, `era`, `whip`, `ip` (pitching)
- [x] 1.4 Replace `market_adp` with `adp` table in `supabase/schema.sql`: `player_id TEXT PRIMARY KEY`, `player_name TEXT`, `position TEXT`, `adp FLOAT`, `updated_at`
- [x] 1.5 Replace `injuries_and_status` with `injuries` table in `supabase/schema.sql`: composite PK `(player_id TEXT, date DATE)`, columns: `player_name TEXT`, `team TEXT`, `il_type TEXT`, `description TEXT`, `updated_at`
- [x] 1.6 Add deprecation comments to old tables (`statcast_daily`, `injuries_and_status`, `market_adp`, `players`) in `supabase/schema.sql`

## 2. Python ingestion — split write targets

- [x] 2.1 Update `_fetch_batters()` in `scripts/fangraphs.py` — add `days_back` parameter to each record dict; use `player_id` as name slug (unchanged)
- [x] 2.2 Update `_fetch_pitchers()` in `scripts/fangraphs.py` — add `days_back` parameter; rename `strikeouts` → `k`, `wins` → `w`, `saves` → `sv`, `holds` → `hld` to match v4 schema
- [x] 2.3 Update `run()` in `scripts/fangraphs.py` — call `write_rows("statcast_batters", batters)` and `write_rows("statcast_pitchers", pitchers)` separately instead of merged `write_rows("players", records)`
- [x] 2.4 Update `write_rows()` in `scripts/utils/db.py` — change upsert `on_conflict` to `"player_id,days_back"` for tables with composite PK; accept an optional `on_conflict` parameter (default `"player_id"`)

## 3. TypeScript API — read from split tables

- [x] 3.1 Add `BATTER_DB_TO_METRIC` mapping to `api/_shared/supabase.ts` for batter-specific column names (`ev_avg → "EV"`, `xba → "xBA"`, `xwoba → "xwOBA"`, `barrel_pct → "Barrel%"`, `hard_hit_pct → "HardHit%"`, `sprint_speed → "Sprint Speed"`, standard hitting cols)
- [x] 3.2 Add `PITCHER_DB_TO_METRIC` mapping to `api/_shared/supabase.ts` for pitcher-specific column names (`xera → "xERA"`, `xfip → "xFIP"`, `xwoba_against → "xwOBA"`, `swstr_pct → "SwStr%"`, `csw_pct → "CSW%"`, `k_pct → "K%"`, `bb_pct → "BB%"`, `k → "K"`, `w → "W"`, `sv → "SV"`, `hld → "HLD"`)
- [x] 3.3 Update `queryPlayersFromDb()` in `api/_shared/supabase.ts` — select `statcast_batters` when `playerType === "hitter"`, `statcast_pitchers` when `"pitcher"`; add `.eq("days_back", query.daysBack ?? 14)` filter
- [x] 3.4 Update `mapDbPlayerToApi()` — accept a `columnMap` parameter (batter or pitcher mapping) instead of the single `DB_TO_METRIC`; remove the old unified `DB_TO_METRIC` constant

## 4. Verify

- [x] 4.1 Run `npm run test` — all tests pass
- [x] 4.2 Run `npm run build` — no errors
- [x] 4.3 Run `npm run lint` — no errors
