# Release preparation

The application is a static site. The root HTML pages load shared `assets/css/base.css` and only their relevant page stylesheets (`tracker.css` or `settings.css`). GitHub Pages needs the root-level HTML pages, `favicon.ico`, `site.webmanifest`, `assets/`, `src/`, and `data/`; the workflow copies root-level `*.html` files automatically so new pages are included without editing the workflow. The app loads its stylesheet, JavaScript modules, and catalog through relative paths, so it works beneath the project-site path `/csharp-quest-tracker/`. The expected URL is <https://lfarci.github.io/csharp-quest-tracker/>. There is no build command, backend, runtime package install, account, or paid service.

`.github/workflows/pages.yml` runs after pushes to `main` and supports manual dispatch. It stages the complete static application (excluding agent-guidance files) and deploys that artifact to the `github-pages` environment. The repository-variable release checks were removed following review feedback. **A merge into `main` can now publish the site automatically.** Review third-party content and the [documented catalog-rights assessment](metadata-rights.md) before merging or manually dispatching changes. The workflow does not assess rights automatically. Configure the repository's Pages source to GitHub Actions.

## Release gate

The site has previously been deployed manually, and the workflow also publishes after pushes to `main`. The [catalog-rights assessment](metadata-rights.md) records that short factual references carry less apparent risk than copying expressive instructions, while original Challenge titles or the complete selection/arrangement may still implicate third-party rights. There is **no confirmed rights-holder license** for the dataset and no technical deployment hold. Changes adding third-party content require renewed review; this documentation does not replace permission or legal advice where required.

The PR browser-smoke workflow serves the static files locally and tests Chromium, Firefox and WebKit independently; these engine-level checks complement, but do not replace, manual Safari and Edge checks.

## Verification completed locally

- `npm test`: all 54 behavior tests pass on the integrated release-preparation branch.
- `docs/catalog-verification.md`: all 114 entries, ordering, pages, fixed rewards, variable notation, stable IDs, and level thresholds were independently checked against the official tracker.
- Browser checks for save/restore, offline loaded-session behavior, cross-tab stale protection, backup export/import, invalid stored-data recovery, confirmed fresh start, mobile layout, keyboard flows, light/dark themes, and reduced coordination/storage availability were completed across the integrated feature slices. Accessible names, roles, focus behavior, and live status feedback were checked through the browser. No manual assistive-technology session was run, so a screen-reader pass remains release acceptance work. See the individual ticket records for the behavior covered by each slice.
- The Pages workflow assembles the static app without compiling or installing runtime dependencies. On 18 October 2026, the staged artifact was served locally under `/csharp-quest-tracker/` and opened in Chromium at a 390px viewport. The page returned HTTP 200, loaded all 114 Challenges and the catalog-backed dashboard, and produced no failed asset requests or JavaScript errors.

After any Pages deployment, verify the public URL, static asset paths, sitemap, and browser persistence behavior.
