## 1. Project setup and configuration

- [x] 1.1 Create the Python project structure, package layout, and required dependency manifest for the planned modules
- [x] 1.2 Add configuration files for leagues, stat weight mappings, cache policy, and scheduler settings
- [x] 1.3 Add environment loading and secret handling for Yahoo OAuth credentials

## 2. Data ingestion and caching

- [x] 2.1 Implement Savant or Statcast data fetching and cache writing
- [x] 2.2 Implement MLB injury and related reference data fetching and cache writing
- [x] 2.3 Implement source-scoped and full refresh CLI workflows
- [x] 2.4 Implement cache validation and TTL-aware reuse logic
- [x] 2.5 Implement scheduled refresh execution with timezone-aware configuration

## 3. Yahoo sync workflows

- [x] 3.1 Implement Yahoo OAuth setup and token refresh support
- [x] 3.2 Implement Yahoo league, roster, and free-agent or waiver sync for configured leagues
- [x] 3.3 Implement Yahoo matchup sync for the current scoring period

## 4. Shared analysis modules

- [x] 4.1 Implement hitter and pitcher metric normalization and league-category mapping helpers
- [x] 4.2 Implement delta and sleeper ranking logic for available players
- [x] 4.3 Implement roster insight calculations for trend, injury, and remaining opportunity context
- [x] 4.4 Implement matchup forecasting and category-targeted recommendation logic
- [x] 4.5 Implement trade impact and player exploration analysis helpers

## 5. Streamlit dashboard pages

- [x] 5.1 Build the main Streamlit app shell with sidebar navigation, league selection, and shared page state
- [x] 5.2 Build the FA Sleeper Report page with filters, sortable table, and player detail drill-down
- [x] 5.3 Build the My Roster page with card views and watch-flag interactions
- [x] 5.4 Build the H2H Matchup page with category grid, confidence modes, and pickup suggestions
- [x] 5.5 Build the Trade Analyzer and Stat Explorer pages with the required comparison workflows

## 6. Operational workflows and verification

- [x] 6.1 Add the startup, auth setup, refresh, scheduler, and optional export script entrypoints
- [x] 6.2 Verify the documented local workflow from setup through dashboard launch
- [x] 6.3 Add tests for configuration loading, cache behavior, and core analysis logic
