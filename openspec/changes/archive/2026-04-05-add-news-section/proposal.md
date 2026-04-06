## Why

Users need quick access to timely baseball news — prospect call-ups and injury updates — to make informed waiver and roster decisions. These feeds are high-signal inputs that currently have no dedicated surface in the dashboard.

## What Changes

- Add a **News** section to the SideNavBar, positioned between **Tools** and **Config**
- Add two new pages under News:
  - **Prospects News** — curated news feed for prospect call-ups, promotions, and debut coverage
  - **Injury Update** — injury tracking feed showing IL placements, return timelines, and status changes
- Register both pages as routes in the React app router
- Update `navigation.ts` to include the new section and nav items

## Capabilities

### New Capabilities

- `prospects-news`: News feed page for prospect-related updates, call-ups, and promotions relevant to fantasy roster decisions
- `injury-update`: Injury tracking page listing current IL players, status changes, and estimated return timelines

### Modified Capabilities

- `responsive-pwa-shell`: SideNavBar gains a new "News" section label and two nav items; section ordering changes (News inserted between Tools and Config)

## Impact

- `src/lib/navigation.ts` — add `News` section and two nav items with paths `/news/prospects` and `/news/injury`
- `src/pages/ProspectsNewsPage.tsx` — new page component
- `src/pages/InjuryUpdatePage.tsx` — new page component
- App router — register the two new routes
- `src/components/layout/AppShell.tsx` — `sectionOrder` constant updated to include `"News"`
