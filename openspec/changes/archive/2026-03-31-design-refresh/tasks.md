## 1. Font: Replace Inter with DM Sans

- [x] 1.1 Install `@fontsource/dm-sans` npm package
- [x] 1.2 Update `src/styles/index.css` — remove Inter fontsource imports, add DM Sans imports (weights 400, 500, 600, 700)
- [x] 1.3 Update `tailwind.config.ts` `fontFamily.body` from `["Inter", "sans-serif"]` to `["DM Sans", "sans-serif"]`
- [x] 1.4 Update `src/styles/tokens.css` `--sn-font-body` from `"Inter", sans-serif` to `"DM Sans", sans-serif`

## 2. Background: Remove Radial Gradient

- [x] 2.1 Update `src/styles/index.css` body background — replace the radial+linear gradient with flat `background: var(--sn-background)`

## 3. MetricCard: Add Tone Accent Border

- [x] 3.1 Update `src/components/ui/MetricCard.tsx` — add `border-t-2` and tone-specific border color classes per variant (`border-primary`, `border-tertiary`, `border-error`, `border-on-surface/30`)

## 4. Tokens: Remove shadow-glow

- [x] 4.1 Remove the `glow` key from `boxShadow` in `tailwind.config.ts`

## 5. Verify

- [x] 5.1 Run `npm run build` — no errors
- [x] 5.2 Run `npm run test` — all tests pass
- [x] 5.3 Run `npm run lint` — no errors
- [x] 5.4 Confirm no `Inter` font references remain in `index.css`
- [x] 5.5 Confirm no `radial-gradient` remains in `index.css` body rule
- [x] 5.6 Confirm no `shadow-glow` in `tailwind.config.ts`
