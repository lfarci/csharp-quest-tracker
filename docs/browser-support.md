# Browser support and discoverability

## Supported browser families

Target current stable Chrome, Edge, Firefox and Safari, including their mobile equivalents. The app uses native ES modules and modern standard browser APIs; Internet Explorer and obsolete browser versions are outside the support target.

- The catalog loads through `fetch` and standard JSON parsing. Tests use the same static assets that GitHub Pages deploys.
- Progress is browser-local. Safe persistent writes require both readable `localStorage` and the Web Locks API. Restricted browsing environments fall back to an in-memory session with a visible export warning instead of risking cross-tab overwrites.
- Native `<dialog>` handles confirmations. Responsive CSS, color-scheme preferences and keyboard focus are part of user-facing acceptance.
- Browser smoke tests run via GitHub Actions with Chromium, Firefox and WebKit engine builds. Actual branded Edge and Safari releases, especially mobile, can still differ; manual checks remain recommended before public release.

## Discoverability

- Public pages use distinct descriptions, canonical project URLs and Open Graph metadata.
- `index.html` includes a small `WebApplication` JSON-LD block describing only the existing application.
- `sitemap.xml` lists the Tracker, About and Settings pages; each has a canonical project URL. Settings is included for consistency with the site's navigation and to make backup instructions discoverable.
- A `robots.txt` under `/csharp-quest-tracker/` would not be the authoritative robots file: crawlers look at the hostname root, outside this project's scope on GitHub Pages. No project-level robots file is added.
- No `llms.txt` is needed. Human-readable, server-rendered HTML about the project, supported site links and standard metadata are more useful than a speculative machine-facing file.
- Sitemap and structured data aid discovery and comprehension but do not guarantee crawler access or ranking.

**Release responsibility:** Pushes to `main` trigger GitHub Pages deployment; there is no repository-variable release gate. Confirm metadata-reuse evidence and publication authorization before merging changes.
