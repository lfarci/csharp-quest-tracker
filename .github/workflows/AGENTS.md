# Workflow conventions

- Keep workflows short and reviewable, with descriptive steps and least-privilege permissions.
- `check-tests.yml` runs `npm test` on pushes and pull requests.
- `browser-smoke.yml` tests a locally hosted site in Chromium, Firefox and WebKit on pull requests; browser tooling is CI-only.
- `pages.yml` stages only the static application. Do not publish directory-scoped `AGENTS.md` files in the artifact.
- `pages.yml` is manually dispatched only; do not add an automatic push/merge deployment trigger without explicit authorization.
- Do not initiate Pages deployment until the metadata-reuse prerequisite is satisfied and deployment is separately authorized.
