## 1. Backend — Python Pipeline

- [x] 1.1 Add `feedparser` to `requirements.txt`
- [x] 1.2 Create `scripts/news.py` with `fetch_rotowire_news()`, `fetch_mlb_transactions()`, `upsert_news()`, `upsert_transactions()`, and `run()` following the existing pipeline module pattern
- [x] 1.3 Add `write_cache_json()` calls in `scripts/news.py` to write `public/exports/player_news.json` and `public/exports/player_transactions.json`
- [x] 1.4 Add `news` step to `scripts/fetch_all.py` (after `adp`, before `backfill`), with try/except so failure is non-fatal

## 2. Backend — Supabase Migration

- [x] 2.1 Document migration SQL for `player_news` and `player_transactions` tables (indexes included) in `scripts/migrations/` or inline comment in `scripts/news.py`

## 3. Backend — API Route

- [x] 3.1 Create `api/news.ts` Vercel serverless route accepting `?type=prospects|injuries`, `?days=`, `?cats=` params
- [x] 3.2 Implement Supabase query for prospects (`player_news` where `categories && ['prospect',...]`)
- [x] 3.3 Implement Supabase query for injuries (`player_transactions` where `categories && ['injury','return']`)
- [x] 3.4 Implement local JSON fallback (`public/exports/player_news.json` / `player_transactions.json`)
- [x] 3.5 Return `400` with error message when `type` param is missing or invalid

## 4. Frontend — Shared Components

- [x] 4.1 Create `src/components/ui/NewsFilterChips.tsx` — horizontal scrollable multi-select chip list with `options`, `selected`, `onChange` props
- [x] 4.2 Create `src/components/ui/NewsCard.tsx` — renders prospect news item: category tag, player + team, summary (3-line clamp), source + relative time
- [x] 4.3 Create `src/components/ui/InjuryCard.tsx` — renders injury item: IL status tag, player + team + position, description, optional return date, source + relative time

## 5. Frontend — Data Hook

- [x] 5.1 Create `src/hooks/useNews.ts` — fetches `/api/news?type=...` and returns `{ data, loading, error }`

## 6. Frontend — Prospects News Page

- [x] 6.1 Replace stub `src/pages/ProspectsNews.tsx` with full page: `PageHeader`, `NewsFilterChips` (All/Recalled/Promoted/Optioned/Debut), filtered `NewsCard` list
- [x] 6.2 Implement loading skeleton (3 placeholder cards) and empty state

## 7. Frontend — Injury Update Page

- [x] 7.1 Replace stub `src/pages/InjuryUpdate.tsx` with full page: `PageHeader`, `NewsFilterChips` (All/IL10/IL15/IL60/DTD/RTN), filtered `InjuryCard` list
- [x] 7.2 Implement loading skeleton (3 placeholder cards) and empty state
