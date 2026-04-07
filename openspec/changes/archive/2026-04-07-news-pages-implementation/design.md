## Context

The News section sidebar items (Prospects News, Injury Update) are currently stub pages with no data or functionality. The data spec and UI spec are fully defined in `prototype/news_spec_v1.md`. The project already has a mature Python data pipeline pattern (savant.py, fangraphs.py, adp.py, backfill.py all following the same `run() → write_rows()` structure) and Vercel API routes serving JSON to the React frontend.

## Goals / Non-Goals

**Goals:**
- Python `scripts/news.py` fetches Rotowire RSS + MLB Transactions, writes to Supabase
- `api/news.ts` Vercel endpoint serves filtered news/injury data (Supabase → local JSON fallback)
- Full Prospects News page with category filter chips (Recalled / Promoted / Optioned / Debut)
- Full Injury Update page with IL status filter chips (IL10 / IL15 / IL60 / DTD / RTN)
- Shared UI components: `NewsCard`, `InjuryCard`, `NewsFilterChips`

**Non-Goals:**
- Real-time push/SSE updates (daily refresh is sufficient)
- Player-level news inside the PlayerDetailCard modal (future work)
- Rotowire paid tier or premium RSS sources
- News search or free-text filtering

## Decisions

**Single API route with `?type=` param vs. two routes**
→ Single `api/news.ts` with `?type=prospects|injuries`. Reduces route count; both datasets are small and follow the same shape. The endpoint accepts optional `?days=` and `?cats=` query params as specified.

**Local JSON fallback path**
→ Follow the existing pattern: `public/exports/player_news.json` and `public/exports/player_transactions.json`. The `scripts/news.py` `run()` function calls `write_cache_json()` in addition to `write_rows()`, exactly like savant.py and fangraphs.py do. This keeps the deployed fallback consistent.

**Frontend data fetching**
→ Use the existing `useSleeperAnalysis`-style pattern: a custom hook `useNews(type)` that fetches from `/api/news?type=...` and returns `{ data, loading, error }`. No new libraries.

**Category derivation on ingest vs. on query**
→ Derive and store `categories: text[]` at ingest time (Python side), not at query time. Matches the existing `player_news` Supabase schema and keeps the API endpoint simple.

**Component granularity**
→ Separate `NewsCard` and `InjuryCard` (not a single polymorphic card). The two card types have different fields (IL status + return date vs. prospect category tag) and different color semantics. A single component would require too many conditional branches.

## Risks / Trade-offs

- **Rotowire RSS reliability** → Feed has been stable for years; wrap `feedparser.parse()` in try/except and return empty list on failure. Pipeline step is non-fatal.
- **Player name matching** → Rotowire uses "First Last" format; MLB API uses structured `person.fullName`. No cross-join needed at this stage — each card shows data from its own source.
- **`feedparser` not in requirements.txt** → Must add before first run. Low risk.
- **Supabase tables don't exist yet** → Migration SQL is defined in the spec. Must be run before the pipeline step goes live. API route must handle missing table gracefully (fall back to local JSON).

## Migration Plan

1. Run Supabase migration SQL (`player_news`, `player_transactions` tables)
2. Add `feedparser` to `requirements.txt`
3. Deploy `scripts/news.py` + `fetch_all.py` update
4. Run `fetch_all.py` once to populate initial data
5. Deploy frontend (API route + pages + components)
6. Verify data flows end-to-end on staging
