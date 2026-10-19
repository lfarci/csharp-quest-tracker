# Workflow conventions

- Keep workflows short and reviewable, with descriptive steps and least-privilege permissions.
- `check-tests.yml` runs `npm test` on pushes and pull requests.
- `browser-smoke.yml` tests a locally hosted site in Chromium, Firefox and WebKit on pull requests; browser tooling is CI-only.
- `pages.yml` stages only the static application. Do not publish directory-scoped `AGENTS.md` files in the artifact.
- Keep the deployment job guard that requires repository variables `METADATA_REUSE_CLEARED` and `PAGES_DEPLOYMENT_AUTHORIZED` to equal the string `true`.
- Do not bypass those conditions, set the variables or deploy before explicit authorization and the metadata-reuse prerequisite are satisfied.
