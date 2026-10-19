# C# Quest Tracker — agent instructions

## Project constraints

Build a small, readable, accessible website with semantic HTML, CSS, and vanilla JavaScript ES modules. No frontend framework, bundler, backend, database, authentication, or runtime dependencies.

The three HTML entry points live at the repository root. JavaScript goes in `src/`, static styles and icons in `assets/`, and the versioned catalog in `data/`. Use relative URLs that work beneath `/csharp-quest-tracker/`.

## Readability first

- Optimize for future maintainers, not shortest possible code. Prefer explicit control flow and descriptive names over one-line tricks.
- Keep functions small and focused; prefer pure functions for business rules, and isolate browser/DOM side effects.
- Follow DRY and KISS: remove duplication without creating abstraction layers for their own sake. Prefer widely supported native JavaScript APIs.
- Use consistent two-space indentation in HTML, CSS, and JavaScript. Put one CSS declaration per line and separate logical groups with blank lines.
- Add section comments and brief explanations of *why* complex logic exists. Avoid comments that restate what the next line obviously does.
- Split deeply nested HTML into multiple lines, keeping the semantic element structure and stable IDs intact.
- Keep CSS design tokens and shared presentation in `assets/css/base.css`; page-specific rules belong in `tracker.css` or `settings.css`.
- Use native HTML elements, labelled inputs, keyboard-friendly controls, useful error text, visible focus indicators and mobile layouts.

## Responsibility boundaries

- `src/progress-session.js`: completion/XP rules and derived view values.
- `src/browser-progress.js`: storage, locks, stale-tab prevention, and recovery.
- UI modules: DOM rendering, events, feedback and browser features rather than XP formulas.
- `data/catalog.json`: source-verified fifth-edition tracking data. Do not invent or silently change book-derived metadata.
- CSV is the portable backup format; browser storage uses JSON.

## Verification and release

Run `npm test` after source, markup or asset changes; keep existing behavior, browser accessibility, mobile display and light/dark appearance. Pull requests also run CI browser smoke tests for Chromium, Firefox and WebKit. Update the Pages assembly paths when public resources move.

Original application code is MIT licensed; the book-derived catalog is **not** sublicensed under MIT. Follow the sourced, qualified assessment in `docs/metadata-rights.md` when changing metadata, and do not add textbook instructions, substantial quotes or artwork. Do not claim author permission without evidence or assume missing permission proves infringement. Pages automatically deploys pushes to `main`; consider third-party rights before merging.

Read directory-local `AGENTS.md` guidance when working in a directory. Do not add placeholder directories or unused assets.
