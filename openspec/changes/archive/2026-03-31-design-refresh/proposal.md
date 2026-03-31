## Why

A visual audit identified that the current UI matches the "2024 AI-generated dashboard" aesthetic almost exactly: dark navy background, amber/gold glowing accents, Inter body font, radial gradient background, and MetricCard hero-metric layout repeated on every page. These are the most common tells of template-generated interfaces. The product needs a distinctive visual identity that feels purposefully designed for fantasy baseball — not interchangeable with any SaaS dashboard.

## What Changes

- **Replace Inter body font** with a more distinctive typeface (e.g., `DM Sans`, `Instrument Sans`, or `Plus Jakarta Sans`) — Inter is the most overused web font; update `tailwind.config.ts` and font loading
- **Revise color palette**: Shift away from the amber-on-navy + glow-shadows combination toward a palette with a stronger point of view; tint neutrals toward the brand hue using OKLCH; ensure no pure black (`#000`) or pure white (`#fff`)
- **Break MetricCard hero template**: The big-number + small-label card appears on every page; differentiate per-page presentation — inline stats, horizontal scorecards, or contextual callouts where cards add no value
- **Remove decorative gradient background**: The radial + linear gradient in `index.css` is pure decoration; replace with a flat or subtly textured surface that doesn't compete with data
- **Remove/reduce glassmorphism**: Audit shadow tokens (`shadow-glow`) and `white/5`, `white/10` opacity patterns for overuse; retain only where purposeful

## Capabilities

### New Capabilities

_(none — this is a visual redesign with no new user-facing functionality)_

### Modified Capabilities

_(none — no spec-level behavior changes; only visual presentation)_

## Impact

**Files modified:**
- `tailwind.config.ts` — updated color tokens, font family
- `src/styles/index.css` — background gradient removal, font imports
- `src/styles/tokens.css` — revised color and shadow tokens
- `src/components/ui/MetricCard.tsx` — potentially refactored or deprecated per-page
- `src/pages/SleeperReport.tsx`, `MyRoster.tsx`, `H2HMatchup.tsx`, `TradeAnalyzer.tsx`, `StatExplorer.tsx` — updated layout patterns

**Dependency on `performance-cleanup`**: Font changes here should be coordinated with the `@fontsource` migration in `performance-cleanup`. Implement `performance-cleanup` first.
