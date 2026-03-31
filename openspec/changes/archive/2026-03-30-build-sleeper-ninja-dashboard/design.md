## Context

Sleeper Ninja is currently defined in planning documents under `prototype/`, but the repository does not yet contain the application code described there. The MVP spans external data ingestion, Yahoo authentication and sync, league-aware analysis logic, and a multi-page Streamlit dashboard. Because this is a cross-cutting greenfield build with external APIs, caching, background scheduling, and several user-facing workflows, the change benefits from an explicit design before implementation.

Constraints include local-first development, `.env`-backed secret management, YAML-driven league configuration, and a clear separation between ingestion, Yahoo integration, domain analysis, and UI modules. The selected timezone for scheduled refreshes is `Asia/Taipei`, and the intended primary usage mode is desktop.

## Goals / Non-Goals

**Goals:**
- Build an initial end-to-end Streamlit application aligned with the three prototype documents.
- Separate system concerns into ingestion, sync, analysis, dashboard, and operational scripts.
- Make league definitions and category mappings configurable through YAML.
- Support both manual refreshes and scheduled refreshes on top of cached data.
- Deliver the five planned dashboard workflows: sleeper report, roster insights, matchup analysis, trade analysis, and stat exploration.

**Non-Goals:**
- Production-grade multi-user hosting, account systems, or shared cloud tenancy.
- Real-time push updates or always-on remote infrastructure in the initial build.
- Mobile-first UI optimization beyond acceptable Streamlit small-screen fallback behavior.
- Long-term historical warehousing beyond the local cached artifacts needed for analysis.

## Decisions

### 1. Use a layered Python architecture
Decision: implement the product as separate Python packages for `pipeline`, `yahoo`, `analysis`, and `dashboard`.

Rationale: this matches the prototype architecture, limits coupling, and keeps API integration, business logic, and UI code isolated enough for testing and incremental changes.

Alternatives considered:
- A single Streamlit-heavy app module. Rejected because it would mix data access, analysis, and rendering logic too early.
- Service-splitting from day one. Rejected because it adds deployment and integration complexity before the single-user workflow is validated.

### 2. Use local cached artifacts as the system boundary between fetch and analysis
Decision: persist refreshed external data into cache files that analysis modules can reuse across pages and refresh cycles.

Rationale: baseball source fetches can be slow and rate-sensitive. A local cache improves responsiveness, reduces duplicate API calls, and fits the local-first operating model in the prototype docs.

Alternatives considered:
- Always fetch live per request. Rejected because it would produce slow page loads and fragile UX.
- Introduce a database immediately. Rejected because it is unnecessary for the first single-user MVP and increases setup burden.

### 3. Make league behavior configuration-driven
Decision: encode league IDs, scoring categories, cache TTLs, and scheduler settings in YAML files.

Rationale: the product is explicitly league-aware, and league rules differ. Configuration files allow new leagues and category mappings without editing core logic.

Alternatives considered:
- Hardcoded league constants. Rejected because it does not scale across league variants.
- Database-backed admin configuration. Rejected for the MVP because it adds persistence and UI management work with little benefit.

### 4. Use Streamlit as the primary UI shell
Decision: implement the MVP interface as a multi-page Streamlit dashboard with reusable components for tables, category grids, and trend charts.

Rationale: the prototype already targets Streamlit, and it is the fastest way to deliver Python-native interactive analytics with minimal frontend overhead.

Alternatives considered:
- A separate JavaScript frontend. Rejected because it would slow down the first build and duplicate data shaping work.

### 5. Build recommendation features on shared analysis primitives
Decision: implement reusable analysis functions for batter, pitcher, delta, sleeper, and matchup logic, then compose those into the sleeper report, roster insights, matchup page, trade analyzer, and stat explorer.

Rationale: several pages depend on overlapping metrics, trends, and league mappings. Shared primitives reduce duplicated formulas and improve consistency across views.

Alternatives considered:
- Page-specific calculations only. Rejected because it would lead to drift in recommendation logic and make tuning harder.

## Risks / Trade-offs

- [External API instability or rate limits] -> Mitigate with cached artifacts, source-scoped refreshes, and explicit failure handling around refresh workflows.
- [Yahoo OAuth setup friction] -> Mitigate with a dedicated setup script and a refresh-capable token workflow.
- [Greenfield scope is broad for one change] -> Mitigate by implementing in phases that match the prototype plan and by keeping tasks grouped by dependency.
- [Forecast accuracy may be questioned early] -> Mitigate by framing matchup outputs as projections and exposing the selected confidence mode.
- [Streamlit UI flexibility may be limited for complex interactions] -> Mitigate by favoring simple interactive patterns first and only introducing richer components where clearly needed.

## Migration Plan

1. Scaffold the Python project structure, configuration files, and script entrypoints described by the architecture.
2. Implement and validate the data ingestion and cache workflows first.
3. Add Yahoo authentication and sync flows for roster and matchup context.
4. Build shared analysis modules on top of normalized cached data.
5. Build the Streamlit dashboard pages and reusable components.
6. Verify manual refresh, scheduled refresh, and local startup workflows.

Rollback is straightforward at the current repo state because this is a greenfield addition. If a partial build proves unstable, the project can disable unfinished pages or scripts while preserving the spec and design artifacts.

## Open Questions

- Which Yahoo league IDs and OAuth app credentials will be used during initial development and testing?
- Which exact formulas should drive trade analysis scoring and overall trade recommendation labels?
- How much persistence is needed for user-specific watch flags beyond a single local environment?
- Should the first implementation include export workflows immediately or defer them to a follow-up change?
