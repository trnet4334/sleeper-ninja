## 1. Self-Host Fonts

- [x] 1.1 Install `@fontsource/inter` and `@fontsource/manrope` npm packages
- [x] 1.2 Add `@fontsource/inter` and `@fontsource/manrope` imports to `src/styles/index.css`
- [x] 1.3 Remove Google Fonts `<link rel="preconnect">` and `<link rel="stylesheet">` tags from `index.html`
- [x] 1.4 Run `npm run dev` and visually verify Inter and Manrope fonts render correctly

## 2. Git Hygiene

- [x] 2.1 Add `*.tsbuildinfo` to `.gitignore`
- [x] 2.2 Verify `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` no longer appear in `git status`

## 3. Remove Duplicate Config Files

- [x] 3.1 Delete `vite.config.js` from project root
- [x] 3.2 Delete `vite.config.d.ts` from project root
- [x] 3.3 Delete root-level `requirements.txt` (canonical file is `scripts/requirements.txt`)
- [x] 3.4 Run `npm run build` and confirm no TypeScript or Vite errors

## 4. Verify

- [x] 4.1 Run `npm run lint` — no new errors
- [x] 4.2 Run `npm run test` — all tests pass
- [x] 4.3 Confirm no `fonts.googleapis.com` or `fonts.gstatic.com` references remain in `index.html`
