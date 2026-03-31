## ADDED Requirements

### Requirement: players table exists in Supabase schema
The `supabase/schema.sql` file SHALL define a `players` table with columns for all metrics the dashboard displays: player identity fields, hitting stats (AVG, OBP, SLG, HR, SB, TB, BB), pitching stats (ERA, WHIP, K, QS, W, SV, HLD), Statcast/advanced metrics (xBA, xwOBA, xSLG, xERA, xFIP, barrel_pct, hard_hit_pct, sprint_speed, ev, swstr_pct, csw_pct, k_pct, bb_pct), and computed fields (trend, delta, recommendation_score).

#### Scenario: players table schema is valid SQL
- **WHEN** `supabase/schema.sql` is executed against a PostgreSQL database
- **THEN** a `players` table is created with `player_id text primary key` and all required stat columns

### Requirement: db.py upserts rows to Supabase when configured
When `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables are present, `scripts/utils/db.py`'s `write_rows(table, rows)` SHALL upsert the rows to the specified Supabase table using `supabase-py`. When credentials are absent, it SHALL write to the local JSON export file (dry-run mode, existing behavior).

#### Scenario: Real upsert when credentials present
- **WHEN** `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
- **THEN** `write_rows("players", rows)` calls Supabase `.upsert(rows)` and returns `{"dry_run": false}`

#### Scenario: Dry-run when credentials absent
- **WHEN** `SUPABASE_URL` is not set
- **THEN** `write_rows("players", rows)` writes a local JSON file and returns `{"dry_run": true}`

### Requirement: fangraphs.py fetches real batting and pitching stats
`scripts/fangraphs.py` SHALL use `pybaseball.batting_stats(season)` and `pybaseball.pitching_stats(season)` to fetch current-season stats, map column names to the `players` table schema, and upsert records via `write_rows("players", rows)`.

#### Scenario: Batting stats populate players table
- **WHEN** `fangraphs.run(days=14)` is called with Supabase configured
- **THEN** player records with AVG, OBP, HR, SB, xwOBA, Barrel%, HardHit% are upserted to the `players` table

#### Scenario: Pitching stats populate players table
- **WHEN** `fangraphs.run(days=14)` is called
- **THEN** pitcher records with ERA, WHIP, K, W, xERA, xFIP, SwStr%, CSW% are upserted to the `players` table
