# Project Context

## Project Overview

Sleeper Ninja is a fantasy baseball dashboard focused on waiver-wire discovery, roster evaluation, head-to-head matchup analysis, trade analysis, and Statcast-driven player exploration.

The product combines data from Baseball Savant / Statcast, MLB Stats APIs, and Yahoo Fantasy APIs to help the user make faster roster decisions based on expected performance rather than surface stats alone.

## Primary Goals

- Surface undervalued free agents with Statcast-backed signals
- Sync the user's Yahoo fantasy roster and matchup context
- Translate baseball metrics into league-category-specific recommendations
- Provide a lightweight dashboard that can be refreshed manually or on a schedule

## Tech Stack

- Language: Python
- UI: Streamlit
- Charting: Plotly
- Data tables: `st.dataframe` and AgGrid
- Scheduling: APScheduler
- External data sources:
  - Baseball Savant / Statcast via `pybaseball`
  - MLB Stats API
  - Yahoo Fantasy API with OAuth 2.0
- Configuration: YAML files in `config/`
- Local secrets: `.env` for Yahoo OAuth credentials and tokens
- Data storage pattern: cached CSV and JSON artifacts under `data/cache/`

## Intended Architecture

- `src/pipeline/`: ingest and refresh external baseball data
- `src/yahoo/`: Yahoo auth, roster sync, and matchup integration
- `src/analysis/`: domain logic for batter, pitcher, delta, sleeper, and matchup analysis
- `src/dashboard/`: Streamlit app entrypoint, reusable components, and page modules
- `scripts/`: setup, refresh, scheduler, and export entrypoints
- `config/`: league-specific settings, category mappings, cache, and scheduler options

## Domain Conventions

- The app is league-aware. Different leagues can have different hitter and pitcher categories.
- Recommendations should be tied to fantasy categories, not generic baseball value.
- Statcast or expected-performance metrics should be preferred when explaining upside or regression candidates.
- Injury state and remaining playing opportunity matter for recommendations.
- Cached data is expected and should be treated as an intentional part of the workflow.

## Engineering Conventions

- Keep pipeline, Yahoo integration, analysis logic, and UI concerns separated by module.
- Prefer configuration-driven behavior over hardcoding league rules.
- Store secrets in `.env` and never commit them.
- Treat `data/cache/` as generated data, not hand-edited source.
- Favor small scripts for operational tasks such as auth setup, refresh, export, and scheduler control.
- Preserve clear page boundaries in the Streamlit dashboard: sleeper report, roster, matchup, trade analyzer, and stat explorer.

## Operational Conventions

- Local development assumes a Python virtual environment.
- Dashboard entrypoint is `streamlit run src/dashboard/app.py`.
- Data refresh should support full refreshes and source-specific refreshes.
- Scheduler behavior and cache TTLs should remain configurable in YAML.
- Timezone-sensitive scheduling should align with `Asia/Taipei`.

## UI Conventions

- Wide-screen desktop usage is the primary target.
- Streamlit-native interaction patterns are acceptable unless a page clearly needs a richer custom component.
- Use color semantically:
  - green for positive or undervalued signals
  - red for negative or overvalued signals
  - amber for warning, day-to-day, or uncertain states
- Show recency and trend information where it affects decision-making.

## Current State Notes

- The repository currently contains product and architecture planning documents under `prototype/`.
- The application code described in those documents does not appear to be scaffolded in the repository yet.
- OpenSpec is initialized with the `spec-driven` schema, but there are no active changes yet.
