## Context

The current UI uses Inter for body text (the most overused web font of 2020–2025), a radial amber glow radiating from the top-left of the page background, and MetricCard components styled as generic rounded cards with colored numbers — patterns that appear almost identically in thousands of AI-generated dashboards. `shadow-glow` token exists in the Tailwind config but is not currently used in any component; the gradient background is the primary visual offender alongside the font choice.

The amber-on-navy palette is thematically coherent for a fantasy baseball product (stadium lights, field dirt) and should be preserved — the problem is the execution (glowing radial gradient) not the concept.

## Goals / Non-Goals

**Goals:**
- Replace Inter body font with DM Sans — a cleaner alternative with more visual personality
- Remove the decorative radial gradient from the page background
- Restyle MetricCard with a top border accent — gives each tone a "editorial scorecard" feel rather than a generic card
- Remove the unused `shadow-glow` token from `tailwind.config.ts` to prevent future misuse

**Non-Goals:**
- Changing the color palette (amber + navy stays — just remove the glow execution)
- Restructuring page layouts or component hierarchies
- Adding new components or removing MetricCard from pages
- Changing Manrope headline font

## Decisions

**Body font: DM Sans over Instrument Sans or Plus Jakarta Sans**

DM Sans has good weight range (300–700), open letterforms that work well at small sizes for data-dense tables, and is not yet overused. Plus Jakarta Sans is slightly more distinctive but has quirky proportions that can look odd in dense tabular data. Instrument Sans is newer and interesting but lacks font weights needed for the current type hierarchy.

`@fontsource/dm-sans` provides weights 300–700. We need 400 (regular), 500 (medium), 600 (semibold), 700 (bold) — all available.

**MetricCard treatment: top accent border over glow effect**

Instead of generic rounded cards, each tone variant gets a 2px colored top border (`border-t-2`) and a slightly lighter background. This creates the feel of an editorial stat block or scorecard — intentional and structured rather than "card template #47". The change is CSS-only on the existing component.

**Background: flat surface color over gradient**

Removing the radial amber gradient `rgba(217, 119, 7, 0.18)` at top-left eliminates the "AI glow aesthetic" instantly. The flat `#0b1326` background with `#131b2e` sidebar creates sufficient depth through surface layering without decorative effects.

## Risks / Trade-offs

- [Font change may shift line heights / truncation] → DM Sans has slightly different metrics than Inter. Check all pages for truncated text after switch. DM Sans tends to be slightly wider at equivalent sizes.
- [MetricCard border adds visual weight] → The 2px border on MetricCard adds clear visual structure. If it feels too heavy, reduce to 1px or use `border-t border-primary/60` with opacity.

## Migration Plan

1. Install `@fontsource/dm-sans`
2. Update `src/styles/index.css` — swap Inter fontsource imports for DM Sans
3. Update `tailwind.config.ts` `fontFamily.body` → `["DM Sans", "sans-serif"]`
4. Update `src/styles/tokens.css` `--sn-font-body` → `"DM Sans", sans-serif`
5. Update `src/styles/index.css` body background — remove radial gradient, keep flat color
6. Remove `shadow-glow` from `tailwind.config.ts` boxShadow
7. Update `src/components/ui/MetricCard.tsx` — add `border-t-2` tone-specific coloring
8. Run `npm run build` + visual check

Rollback: revert `index.css`, `tokens.css`, `tailwind.config.ts`, and `MetricCard.tsx` — no data model changes involved.

## Open Questions

- Should the `shadow-ambient` token on the sidebar also be refined? It's currently `rgba(35, 49, 67, 0.08)` which is very subtle. Keeping as-is for now.
