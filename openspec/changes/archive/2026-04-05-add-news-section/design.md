## Context

Sleeper Ninja is a React + TypeScript SPA with a sidebar-driven navigation (`AppShell.tsx`). Navigation items are defined in `src/lib/navigation.ts` and grouped into sections via a `sectionOrder` constant in `AppShell.tsx`. The router is configured in the app's root (likely `App.tsx`). Pages are standalone React components in `src/pages/`.

The dashboard currently has three nav sections: Fantasy HQ, Tools, Config. This change inserts a new **News** section between Tools and Config, with two placeholder pages that can be progressively enhanced with real data feeds.

## Goals / Non-Goals

**Goals:**
- Add "News" as a nav section in the sidebar between Tools and Config
- Add `Prospects News` page at `/news/prospects`
- Add `Injury Update` page at `/news/injury`
- Register both routes in the app router
- Pages are functional stubs — correct layout, heading, and placeholder content

**Non-Goals:**
- Live news data ingestion or external API integration (future work)
- Search, filtering, or pagination on news items
- Push notifications or real-time updates

## Decisions

**1. Section ordering via `sectionOrder` constant**
`AppShell.tsx` drives section order through a typed `sectionOrder` array. Adding `"News"` between `"Tools"` and `"Config"` is a one-line change with no structural risk.
- Alternative: dynamic section order from `navItems` — rejected; explicit ordering is intentional and readable.

**2. Flat routes under `/news/`**
Paths `/news/prospects` and `/news/injury` are flat rather than nested router outlets. The current app uses top-level flat routes with no nested `<Outlet>` patterns.
- Alternative: nested route with a `/news` layout — unnecessary complexity for two pages with no shared sub-layout.

**3. Stub pages with `PageHeader`**
Both pages reuse the existing `PageHeader` component (used on all other pages) for consistent visual identity. Content is a clearly labeled placeholder card. No new components needed.

## Risks / Trade-offs

- **No real data yet** → Pages show placeholder UI. Risk of feeling incomplete at first glance. Mitigation: use "Coming Soon" framing consistent with the dashboard's editorial tone.
- **Route naming** → `/news/prospects` and `/news/injury` assume the paths won't conflict with future nested routing needs. Mitigation: paths are namespaced under `/news/` giving room to expand.

## Open Questions

- Should `Prospects News` and `Injury Update` eventually pull from a specific API (MLB Stats, Rotoworld, etc.)? To be decided when data ingestion is scoped.
