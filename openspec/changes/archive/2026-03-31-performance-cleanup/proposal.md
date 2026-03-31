## Why

Three categories of housekeeping debt are slowing down development and degrading load performance: Google Fonts CDN introduces an external round-trip on every page load (hurting FCP/LCP and leaking user IP to Google); build artifacts are being tracked in git causing noisy diffs on every build; and duplicate/misplaced configuration files make it unclear which file is the source of truth.

## What Changes

- **Self-host fonts**: Replace Google Fonts `<link>` tags in `index.html` with `@fontsource/inter` and `@fontsource/manrope` npm packages loaded in `src/styles/index.css`; remove the `preconnect` tags
- **Gitignore build artifacts**: Add `*.tsbuildinfo` to `.gitignore` so `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` stop appearing as untracked files
- **Remove duplicate vite config**: Delete `vite.config.js` and `vite.config.d.ts` from the project root — `vite.config.ts` is the source of truth
- **Remove duplicate requirements.txt**: Delete the root-level `requirements.txt`; `scripts/requirements.txt` is the canonical file
- **Consolidate config location**: Move `eslint.config.js`, `postcss.config.js`, `tailwind.config.ts`, and `tsconfig*.json` to project root if not already there (Vite convention); delete the `/config/` directory if it becomes empty

## Capabilities

### New Capabilities

_(none — this is infrastructure and tooling cleanup with no new user-facing functionality)_

### Modified Capabilities

_(none — no spec-level behavior changes)_

## Impact

**Files modified/deleted:**
- `index.html` — remove Google Fonts `<link>` and `preconnect` tags
- `src/styles/index.css` — add `@fontsource` imports
- `package.json` — add `@fontsource/inter` and `@fontsource/manrope` devDependencies
- `.gitignore` — add `*.tsbuildinfo`
- `vite.config.js`, `vite.config.d.ts` — **delete**
- `requirements.txt` (root) — **delete**
- `/config/` directory — audit and consolidate or delete

**Bundle impact**: Font CSS and WOFF2 files move from CDN to the Vite bundle. Expect a small increase in initial JS/CSS bundle size but elimination of the external DNS lookup and font render-blocking request.
