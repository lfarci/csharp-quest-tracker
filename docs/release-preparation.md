# Release preparation

The application is a static site. The root HTML pages load shared `assets/css/base.css` and only their relevant page stylesheets (`tracker.css` or `settings.css`). GitHub Pages needs the root-level HTML pages, `favicon.ico`, `site.webmanifest`, `assets/`, `src/`, and `data/`; the workflow copies root-level `*.html` files automatically so new pages are included without editing the workflow. The app loads its stylesheet, JavaScript modules, and catalog through relative paths, so it works beneath the project-site path `/csharp-quest-tracker/`. The expected URL is <https://lfarci.github.io/csharp-quest-tracker/>. There is no build command, backend, runtime package install, account, or paid service.

`.github/workflows/pages.yml` deploys on pushes to `main` and also supports manual dispatch. It stages the complete static application (excluding agent-guidance files) and deploys that artifact to the `github-pages` environment; it does not deploy from feature or integration branches. Both triggers are gated: the repository variables `METADATA_REUSE_CLEARED` and `PAGES_DEPLOYMENT_AUTHORIZED` must each be set to the exact value `true`. Configure them only after the metadata-reuse prerequisite is resolved and separate deployment authorization is given. Until then, the deploy job is skipped. Configure the repository's Pages source to GitHub Actions before deployment.

## Release gate

Issue #9 remains unresolved. `docs/metadata-rights.md` records the sources and the limit of the evidence: catalog fidelity and attribution do not establish a reuse grant for the book-derived catalog. The workflow is prepared but no deployment has been run. Keep both repository release-gate variables unset or set to a value other than `true` until the agreed reuse prerequisite is resolved and separate deployment authorization is given. Do not publish the application or catalog before then.

The PR browser-smoke workflow serves the static files locally and tests Chromium, Firefox and WebKit independently; these engine-level checks complement, but do not replace, manual Safari and Edge checks.

## Verification completed locally

- `npm test`: all 54 behavior tests pass on the integrated release-preparation branch.
- `docs/catalog-verification.md`: all 114 entries, ordering, pages, fixed rewards, variable notation, stable IDs, and level thresholds were independently checked against the official tracker.
- Browser checks for save/restore, offline loaded-session behavior, cross-tab stale protection, backup export/import, invalid stored-data recovery, confirmed fresh start, mobile layout, keyboard flows, light/dark themes, and reduced coordination/storage availability were completed across the integrated feature slices. Accessible names, roles, focus behavior, and live status feedback were checked through the browser. No manual assistive-technology session was run, so a screen-reader pass remains release acceptance work. See the individual ticket records for the behavior covered by each slice.
- The Pages workflow assembles the static app without compiling or installing runtime dependencies. On 18 October 2026, the staged artifact was served locally under `/csharp-quest-tracker/` and opened in Chromium at a 390px viewport. The page returned HTTP 200, loaded all 114 Challenges and the catalog-backed dashboard, and produced no failed asset requests or JavaScript errors.

The public URL and post-deployment checks remain pending the release gate above.
