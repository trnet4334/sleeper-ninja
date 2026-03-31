## 1. Repository foundation

- [x] 1.1 Replace the current Python-only app skeleton with the v2 repo layout for `src/`, `api/`, and `scripts/`
- [x] 1.2 Add frontend dependencies and tooling for React, Vite, TypeScript, Tailwind CSS, React Router, Zustand, TanStack Table, and Recharts
- [x] 1.3 Add shared environment configuration for Supabase, Yahoo OAuth, and deployment base URL
- [x] 1.4 Add baseline linting, type-checking, and test commands for both TypeScript and Python paths
- [x] 1.5 Extract design tokens, typography, surfaces, and layout primitives directly from `prototype/UIUX`

## 2. Responsive shell and PWA foundation

- [x] 2.1 Build the shared app shell to match `prototype/UIUX/dashboard.html`, including sidebar, top league tab bar, and editorial page scaffolding
- [x] 2.2 Add responsive breakpoints and mobile-safe variants for navigation, dense tables, cards, and page controls
- [x] 2.3 Add PWA manifest, icons, service worker registration, and shell-first asset caching
- [x] 2.4 Add tests or verification checks for installability metadata, shell rendering, and responsive navigation behavior

## 3. Settings and category context

- [x] 3.1 Implement localStorage storage helpers for leagues, categories, and stat preferences
- [x] 3.2 Implement `useLeagues`, `useCategories`, `useStatPrefs`, and `CategoryContext`
- [x] 3.3 Build the league tab bar with add, select, and delete flows
- [x] 3.4 Build League Manager, Category Manager, and Stat Preferences UI flows
- [x] 3.5 Add tests for localStorage persistence and CategoryContext updates

## 4. Supabase and Yahoo integration

- [x] 4.1 Add frontend and server-side Supabase clients with environment-driven configuration
- [x] 4.2 Implement Yahoo auth start and callback API routes
- [x] 4.3 Implement Yahoo token persistence and refresh logic in Supabase-backed server code
- [x] 4.4 Implement Yahoo roster and matchup sync API routes for configured leagues
- [x] 4.5 Add tests for Yahoo auth, token refresh, and protected server-side data access

## 5. Shared data and analysis APIs

- [x] 5.1 Implement shared stat-mapping utilities that support default mappings and league overrides
- [x] 5.2 Implement `/api/data/players` for category-aware player queries
- [x] 5.3 Implement `/api/data/analysis` for delta, z-score, and recommendation calculations
- [x] 5.4 Implement `/api/data/matchup` for category-level head-to-head forecasting
- [x] 5.5 Add API tests for CategoryContext-driven request parameters and response shapes

## 6. Prototype-faithful page implementation

- [x] 6.1 Implement FA Sleeper Report to match the approved prototype hierarchy while supporting dynamic columns, filters, sorting, and player drill-down
- [x] 6.2 Implement My Roster to match the approved prototype card rhythm, trend context, and watch/drop annotations
- [x] 6.3 Implement H2H Matchup to match the approved prototype hierarchy with category grid, confidence mode controls, and pickup suggestions
- [x] 6.4 Implement Trade Analyzer and Stat Explorer with prototype-aligned shell language, league-aware analysis, comparisons, and chart panels
- [x] 6.5 Review all primary pages against `prototype/UIUX/dashboard.html` and record any intentional deviations

## 7. Background ingestion pipeline

- [x] 7.1 Implement Python scripts for Savant, MLB Stats, FanGraphs, and ADP ingestion
- [x] 7.2 Implement shared Python utilities for Supabase writes, source-scoped refreshes, and incremental fetch handling
- [x] 7.3 Implement `fetch_all.py` orchestration for full and source-specific refresh runs
- [x] 7.4 Add GitHub Actions cron workflow and required secrets documentation for daily refreshes
- [x] 7.5 Add tests for source-scoped refresh behavior and pipeline write contracts

## 8. Release readiness

- [x] 8.1 Add Supabase schema migrations and setup documentation aligned with the v2 architecture
- [x] 8.2 Add deployment configuration and environment variable documentation for Vercel
- [x] 8.3 Verify end-to-end league setup, Yahoo connect, page fetch, responsive behavior, PWA installability, and scheduled refresh flows
- [x] 8.4 Remove obsolete v1 implementation assumptions from code and docs that conflict with the v2 web architecture
