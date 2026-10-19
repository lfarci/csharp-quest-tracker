# Workflow conventions

- Keep workflows short and reviewable, with descriptive steps and least-privilege permissions.
- `check-tests.yml` runs `npm test` on pushes and pull requests.
- `browser-smoke.yml` tests a locally hosted site in Chromium, Firefox and WebKit on pull requests; browser tooling is CI-only.
- `pages.yml` stages only the static application. Do not publish directory-scoped `AGENTS.md` files in the artifact.
- `pages.yml` deploys automatically on pushes to `main` and also supports manual dispatch; keep triggers aligned with repository deployment policy.
- Deployment is no longer protected by repository-variable checks. Changes merged into `main` can be published automatically, so verify metadata-reuse rights and publication authorization before merging.
