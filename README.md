# Sleeper Ninja

Fantasy baseball dashboard for waiver-wire discovery and roster decision-making, powered by Statcast and Yahoo Fantasy.

## What it does

| Page | Description |
|---|---|
| **FA Sleeper Report** | Ranks available free agents by F-Score — a multi-layer algorithm using category Z-scores, expected stats, contact quality, and recent trends |
| **My Roster** | Syncs your Yahoo Fantasy roster and surfaces hold/drop signals |
| **Matchup Analysis** | Projects H2H category outcomes for the current scoring week |
| **Trade Analyzer** | Compares trade packages across your league's fantasy categories |
| **Stat Explorer** | Free-form player search and stat comparison table |
| **Prospects News** | Call-up and prospect coverage relevant to waiver decisions |
| **Injury Update** | IL placements, return timelines, and status changes |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| API | Vercel Serverless Functions (TypeScript) |
| Database | Supabase (PostgreSQL) |
| Data pipeline | Python + pybaseball |
| Auth | Yahoo Fantasy OAuth 2.0 |

## Data sources

- **Baseball Savant / Statcast** — xBA, xSLG, xwOBA, barrel%, exit velocity, sprint speed
- **FanGraphs** — traditional stats, xERA, xFIP, SwStr%, CSW%
- **MLB Stats API** — injury / IL status
- **FantasyPros** — ADP and position eligibility

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (or run locally — the app falls back to static JSON exports)

### Frontend

```bash
npm install
npm run dev          # UI only (port 5173)
npm run dev:full     # UI + API serverless functions
```

### Data pipeline

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

# Fetch all sources and recompute F-scores
python3 scripts/fetch_all.py

# Single source (e.g. FanGraphs only)
python3 scripts/fetch_all.py --source fangraphs
```

Pipeline execution order: `savant → mlb_stats → fangraphs → adp → backfill → scoring`

### Environment variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
YAHOO_CLIENT_ID=your-yahoo-client-id
YAHOO_CLIENT_SECRET=your-yahoo-client-secret
```

### Supabase setup

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor to create the required tables.

## F-Score

The ranking algorithm used in the Sleeper Report:

| Layer | Weight | Signal |
|---|---|---|
| Category Z-score | 60% | Relative performance vs. available player pool |
| xStat correction | 15% | Expected stats filtering out luck |
| Contact quality / stability | 10% | Barrel%, hard-hit%, whiff% |
| Trend + injury | 15% | Recent hotness, IL return timing |

**Delta** = `xwOBA − AVG` for hitters, `ERA − xERA` for pitchers. Positive delta = underperforming true talent = buy signal.

## Deployment

- **Frontend + API**: Vercel ([`vercel.json`](vercel.json))
- **Daily data refresh**: GitHub Actions ([`.github/workflows/daily-data-refresh.yml`](.github/workflows/daily-data-refresh.yml))

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
python3 -m unittest discover -s tests -v
```

## Repository layout

```
src/          React frontend
api/          Vercel serverless route handlers
scripts/      Python data ingestion pipeline
supabase/     Database schema
public/       Static assets and local JSON fallbacks
tests/        Python verification tests
openspec/     Planning and spec artifacts
prototype/    Archived design reference
```
