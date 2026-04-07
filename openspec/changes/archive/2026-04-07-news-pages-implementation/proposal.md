## Why

The News section (Prospects News + Injury Update) exists in the sidebar as stub pages with no data. Fantasy users need real-time roster intelligence — call-up timing and IL placement directly affect waiver wire decisions, and missing this forces users to leave the app.

## What Changes

- Wire up `scripts/news.py` Python module to fetch Rotowire RSS and MLB Transactions API
- Add `scripts/fetch_all.py` integration so news runs as part of the daily data refresh
- Add Vercel API route `api/news.ts` serving prospects and injury data from Supabase (with local JSON fallback)
- Replace stub `ProspectsNews.tsx` with full page: filterable news card list
- Replace stub `InjuryUpdate.tsx` with full page: filterable injury card list
- Build shared UI components: `NewsCard`, `InjuryCard`, `NewsFilterChips`

## Capabilities

### New Capabilities

- `news-data-pipeline`: Python ingestion of Rotowire RSS + MLB Transactions API into Supabase
- `news-api-endpoint`: Vercel serverless route serving structured prospect and injury data
- `prospects-news-page`: Full Prospects News UI with category filtering (Recalled/Promoted/Optioned/Debut)
- `injury-update-page`: Full Injury Update UI with IL status filtering (IL10/IL15/IL60/DTD/RTN)

### Modified Capabilities

- `fetch-all-pipeline`: Add news step to the existing `scripts/fetch_all.py` orchestration

## Impact

- New files: `scripts/news.py`, `api/news.ts`, `src/components/ui/NewsCard.tsx`, `src/components/ui/InjuryCard.tsx`, `src/components/ui/NewsFilterChips.tsx`
- Modified files: `scripts/fetch_all.py`, `src/pages/ProspectsNews.tsx`, `src/pages/InjuryUpdate.tsx`
- New Supabase tables: `player_news`, `player_transactions` (schema in `prototype/news_spec_v1.md`)
- New Python dependency: `feedparser` for RSS parsing
- No breaking changes to existing pages
