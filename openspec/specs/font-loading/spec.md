### Requirement: Fonts served from app bundle
The application SHALL load Inter and Manrope typefaces from the Vite-bundled assets rather than an external CDN. No network request to `fonts.googleapis.com` or `fonts.gstatic.com` SHALL be made on page load.

#### Scenario: Font CSS imports present in global stylesheet
- **WHEN** the application stylesheet (`index.css`) is parsed
- **THEN** `@font-face` declarations for Inter and Manrope are present, referencing local WOFF2 files served from the same origin

#### Scenario: No Google Fonts link tags in HTML
- **WHEN** the compiled `index.html` is inspected
- **THEN** there are no `<link>` tags with `href` pointing to `fonts.googleapis.com` or `fonts.gstatic.com`

### Requirement: Build artifacts excluded from version control
The build system SHALL NOT track incremental TypeScript compiler output files in git. Files matching `*.tsbuildinfo` SHALL be listed in `.gitignore`.

#### Scenario: tsbuildinfo files are ignored
- **WHEN** `git status` is run after a TypeScript build
- **THEN** `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` do not appear as untracked or modified files

### Requirement: Single authoritative Vite config
The project SHALL contain exactly one Vite configuration file. `vite.config.ts` is the source of truth. `vite.config.js` and `vite.config.d.ts` SHALL NOT exist in the repository.

#### Scenario: No duplicate vite config files
- **WHEN** the repository root is listed
- **THEN** only `vite.config.ts` exists; `vite.config.js` and `vite.config.d.ts` are absent

### Requirement: Single authoritative Python requirements file
The project SHALL maintain exactly one `requirements.txt`. `scripts/requirements.txt` is the canonical file. The root-level `requirements.txt` SHALL NOT exist.

#### Scenario: Root requirements.txt is absent
- **WHEN** the repository root is listed
- **THEN** `requirements.txt` does not exist at the root level; `scripts/requirements.txt` exists
