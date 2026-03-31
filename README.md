# Sleeper Ninja

Sleeper Ninja is a fantasy baseball analytics web app built around a premium editorial dashboard experience. The v2 architecture uses a React + Vite frontend, Vercel-style API routes, Supabase-backed data services, and Python ingestion scripts.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Zustand + localStorage
- TanStack Table
- Recharts
- Vite PWA
- Supabase
- Python ingestion scripts for scheduled baseball data refreshes

## Repository Layout

```text
src/        frontend app
api/        serverless route handlers
scripts/    python ingestion and utility entrypoints
public/     static and PWA assets
tests/      python verification tests
supabase/   schema and setup artifacts
prototype/  archived product and design reference
openspec/   planning artifacts
```

## Local Development

```bash
npm install
npm run dev
```

Python ingestion setup:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
python3 scripts/fetch_all.py
python3 scripts/fetch_all.py --source savant --days 7
```

## Environment

Frontend and server routes:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
YAHOO_CLIENT_ID=your-yahoo-client-id
YAHOO_CLIENT_SECRET=your-yahoo-client-secret
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_KEY`

## Supabase Setup

Run the schema in [supabase/schema.sql](/Users/stevy/Documents/Git/sleeper-ninja/supabase/schema.sql) inside Supabase SQL Editor.

## Deploy

- Frontend/API deployment uses Vercel with config in [vercel.json](/Users/stevy/Documents/Git/sleeper-ninja/vercel.json)
- Daily refresh workflow lives in [.github/workflows/daily-data-refresh.yml](/Users/stevy/Documents/Git/sleeper-ninja/.github/workflows/daily-data-refresh.yml)

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
python3 -m unittest discover -s tests -v
```

## Product Direction

- Rebuild the shell and page hierarchy to match `prototype/UIUX/dashboard.html`
- Preserve league-aware fantasy workflows across Sleeper Report, Roster, Matchup, Trade, and Explorer
- Support responsive layouts and installable PWA behavior from the first web release
