## Context

Trade Analyzer (`src/pages/TradeAnalyzer.tsx`) and Stat Explorer (`src/pages/StatExplorer.tsx`) are fully functional but visually diverge from the new designs in `prototype/UIUX/trade_analyzer.html` and `prototype/UIUX/stat_explorer.html`. The prototype uses a 12-column CSS grid bento layout, a custom SVG polygon radar, improved breakout card composition, and richer trend labels. Both pages share the same Tailwind design-token palette (primary=amber, surface layers, on-surface-variant) and the same side/top nav that must remain unchanged.

Existing hooks (`useRosterData`, `useSleeperAnalysis`, `useCategories`) and all data-fetching logic stay untouched. This is a pure presentational upgrade.

## Goals / Non-Goals

**Goals:**
- Trade Analyzer: 12-col bento first row (4+4+4), SVG polygon radar replacing the placeholder `<TeamRadar />`, second row split 8+4 (radar left, category comparison right), Accept Trade CTA button in the Projected Delta card.
- Stat Explorer: Navigation arrows on the breakout horizontal scroll row, round avatar with grayscale-to-color hover, 2-stat mini-grid inside breakout card, table row avatars (initial fallback), richer trend labels (ELITE / MVP / SPEED based on score thresholds, plus HOT / COLD / STEADY).
- Keep all existing TypeScript types, hooks, filtering, pagination, and routing.

**Non-Goals:**
- Wiring real Accept Trade action (button is UI-only).
- Adding real player headshot images (avatars use initials/placeholder).
- Changing the side nav or top nav.
- Any API or data model changes.

## Decisions

**1. SVG radar inline in TradeAnalyzer instead of separate component**
The existing `TeamRadar.tsx` is a placeholder with no real data props. Rather than extend its interface, render the SVG polygon radar directly in `TradeAnalyzer.tsx` using static mockup polygon points (same as prototype). This keeps the component surface small and avoids a complex data-to-polygon-point mapping that isn't needed for the visual milestone.
_Alternative considered_: Fully data-driven radar with computed polygon from category Z-scores. Deferred — too complex for a UI-parity task.

**2. Trend label tiers for Stat Explorer**
Replace the binary HOT/COLD/STEADY badge with a 5-tier system: `score >= 90 → ELITE`, `score >= 75 → MVP`, `score >= 60 → SPEED` (for fast players with high SB), otherwise fall back to the existing delta-based HOT/COLD/STEADY. The label text matches the prototype sample rows (Ohtani=ELITE, Judge=MVP, Witt=SPEED).

**3. Breakout card avatar: initials fallback**
The prototype uses real player headshots from an external CDN. Since we don't have real image URLs per player, the redesigned `BreakoutCard` will show a styled initials circle (first+last initial, amber background). This is a known placeholder that a future task can replace with real headshot URLs.

**4. Scroll arrows for Breakout Alerts using JS scrollBy**
Use `useRef` on the scroll container and `scrollBy({ left: ±340, behavior: 'smooth' })` on the prev/next buttons — no third-party carousel library needed.

## Risks / Trade-offs

- [Risk] SVG radar polygon points are hardcoded mockup values → Mitigation: Label them with a `// TODO: compute from real category Z-scores` comment so the next developer knows where to connect real data.
- [Risk] Trend label tiers (ELITE/MVP/SPEED) are heuristic thresholds → Mitigation: Simple constants at the top of the file, easy to tune.
- [Risk] BreakoutCard initials avatar differs from prototype headshots → Mitigation: Documented as placeholder; no regression on functionality.

## Migration Plan

1. Update `src/components/trade/TeamRadar.tsx` — replace with inline SVG polygon. Existing usages: only `TradeAnalyzer.tsx`.
2. Rewrite `src/pages/TradeAnalyzer.tsx` layout to 12-col bento.
3. Update `src/components/statexplorer/BreakoutCard.tsx` — new card layout with initials avatar + 2-stat mini-grid.
4. Rewrite `src/pages/StatExplorer.tsx` — add scroll ref/arrows, swap `trendBadge` with new tier function.
5. Manual visual check: open both pages, verify layout, check mobile at 768px.

No rollback needed — changes are isolated to presentational files.

## Open Questions

- Should the Accept Trade button in Trade Analyzer be wired to a real action (e.g., open Yahoo trade flow) or remain UI-only? → Deferred to a future Yahoo integration task.
- Should BreakoutCard show real headshot images from a Sleeper/Baseball Reference CDN? → Deferred; initials fallback is acceptable for now.
