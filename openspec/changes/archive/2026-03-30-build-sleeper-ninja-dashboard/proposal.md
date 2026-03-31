## Why

The repository has product planning documents for a fantasy baseball assistant, but it does not yet have a formal OpenSpec change that turns those plans into implementable requirements. This change establishes the MVP contract for building Sleeper Ninja so implementation can proceed against clear capabilities, scope boundaries, and operational expectations.

## What Changes

- Introduce an initial end-to-end MVP for Sleeper Ninja as a Python and Streamlit application.
- Define requirements for ingesting and caching Statcast, MLB injury, and Yahoo fantasy data.
- Define requirements for league-aware Yahoo roster and matchup synchronization.
- Define requirements for the dashboard pages: FA Sleeper Report, My Roster, H2H Matchup, Trade Analyzer, and Stat Explorer.
- Define requirements for manual refresh, scheduled refresh, and local configuration workflows.
- Capture the implementation design and phased task plan needed to make the change apply-ready.

## Capabilities

### New Capabilities
- `baseball-data-pipeline`: Fetch, normalize, and cache external baseball and injury data needed by the dashboard.
- `yahoo-fantasy-sync`: Authenticate with Yahoo and sync league, roster, waiver, and matchup data for configured leagues.
- `sleeper-report`: Surface undervalued free agents with league-aware filters and Statcast-based deltas.
- `roster-insights`: Show the user's roster health, short-term trend signals, and drop-watch annotations.
- `matchup-analysis`: Forecast category outcomes for the current head-to-head matchup and recommend waiver pickups for weak categories.
- `player-evaluation-tools`: Provide trade analysis and player-level Statcast exploration for decision support.

### Modified Capabilities

None.

## Impact

- Affects planned modules under `src/pipeline`, `src/yahoo`, `src/analysis`, `src/dashboard`, and `scripts`.
- Introduces dependencies on external baseball data providers and Yahoo OAuth flows.
- Requires local configuration and secrets management through YAML files and `.env`.
- Establishes the baseline OpenSpec requirements that future incremental changes will extend.
