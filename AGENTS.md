# C# Quest Tracker — agent instructions

## Project constraints

Build a small, readable, accessible website with semantic HTML, CSS, and vanilla JavaScript ES modules. No frontend framework, bundler, backend, database, authentication, or runtime dependencies.

The three HTML entry points live at the repository root. JavaScript goes in `src/`, static styles and icons in `assets/`, and the versioned catalog in `data/`. Use relative URLs that work beneath `/csharp-quest-tracker/`.

## Readability first

- Optimize for future maintainers, not shortest possible code. Prefer explicit control flow and descriptive names over one-line tricks.
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

Original application code is MIT licensed, but book-derived catalog metadata requires separate reuse evidence (see `docs/metadata-rights.md` and issue #9). Do not contact the author or deploy without authorization. The Pages workflow must require `METADATA_REUSE_CLEARED` and `PAGES_DEPLOYMENT_AUTHORIZED` to both equal `true`.

Read directory-local `AGENTS.md` guidance when working in a directory. Do not add placeholder directories or unused assets.
