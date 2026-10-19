# Agent instructions — C# Quest Tracker

## Stack and boundaries

- Keep the project a static website built with semantic HTML, CSS and vanilla JavaScript ES modules.
- No JavaScript UI framework, backend, database, authentication, bundler or build step.
- Keep the HTML pages at the repository root, application JavaScript in `src/`, catalog in `data/`, and CSS and visual assets in `assets/`.
- Keep `favicon.ico` and `site.webmanifest` at the root for conventional browser discovery.
- Use relative asset paths that work beneath the GitHub Pages project path `/csharp-quest-tracker/`.

## Code responsibilities

- `src/progress-session.js` owns completion rules, XP calculation and derived dashboard data.
- `src/browser-progress.js` owns browser persistence and cross-tab coordination.
- Browser-facing modules own DOM interactions and browser capabilities; avoid moving domain rules into them.
- `data/catalog.json` is the versioned, verified fifth-edition catalog. Do not invent or alter book-derived metadata without source verification.
- CSV is the portable progress backup format. Browser storage uses JSON; do not silently change either contract.

## Quality

- Prefer minimal, focused changes over speculative abstractions.
- Preserve keyboard accessibility, semantic HTML, responsive layouts and light/dark theme behavior.
- Use the built-in Node.js test runner (`npm test`); add or update tests for behavior changes.
- Keep shared tokens, navigation, and generic controls in `assets/css/base.css`; place page-specific rules and responsive overrides in `tracker.css` or `settings.css`.
- When moving public files, update HTML, manifest and GitHub Pages staging paths together.
- Do not introduce runtime dependencies solely for tooling convenience.

## Release and permissions

- Book-derived metadata is subject to a separate reuse prerequisite (see `docs/metadata-rights.md` and issue #9); the MIT license covers original application code only.
- Do not publicly deploy the app, bypass the Pages release gates, or contact the book author without explicit authorization.
- The Pages workflow requires both `METADATA_REUSE_CLEARED` and `PAGES_DEPLOYMENT_AUTHORIZED` to equal `true`.
