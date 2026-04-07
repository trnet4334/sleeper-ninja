## ADDED Requirements

### Requirement: Fetch Rotowire RSS news
The pipeline SHALL fetch the Rotowire MLB RSS feed, parse each entry into a structured record, classify it into one or more categories (injury, return, prospect, role, trade), and upsert into the `player_news` Supabase table.

#### Scenario: Successful RSS fetch
- **WHEN** `scripts/news.py` `run()` is called and Rotowire RSS is reachable
- **THEN** all entries are parsed, categorized, and upserted to `player_news` with no duplicates (deduplicated on `source + link`)

#### Scenario: RSS feed unreachable
- **WHEN** the RSS endpoint returns an error or times out
- **THEN** the function logs the error and returns an empty list without raising; the pipeline step is non-fatal

### Requirement: Fetch MLB Transactions
The pipeline SHALL fetch MLB Stats API transactions for the past 7 days, classify each by `typeDesc` into categories (injury, return, prospect, trade), and upsert into the `player_transactions` Supabase table.

#### Scenario: Successful transactions fetch
- **WHEN** `run()` is called and the MLB Stats API is reachable
- **THEN** transactions for `startDate` to `endDate` (7 days) are upserted, deduplicated on `source + player_id + date + type_code`

#### Scenario: API unreachable
- **WHEN** the MLB Stats API returns a non-200 response
- **THEN** the function logs the error and returns an empty list without raising

### Requirement: Write local JSON fallback
The pipeline SHALL write fetched records to `public/exports/player_news.json` and `public/exports/player_transactions.json` via `write_cache_json()`, following the same pattern as savant.py and fangraphs.py.

#### Scenario: Cache written after successful fetch
- **WHEN** news and transactions are fetched successfully
- **THEN** both JSON files are written to `public/exports/` before the function returns

### Requirement: feedparser dependency declared
The module SHALL list `feedparser` in `requirements.txt` so the pipeline runs in CI and on any fresh install.

#### Scenario: Dependency present
- **WHEN** `pip install -r requirements.txt` is run
- **THEN** `feedparser` is installed and `import feedparser` succeeds
