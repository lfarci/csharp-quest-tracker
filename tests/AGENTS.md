# Test conventions

- Use the existing built-in Node.js test runner (`node:test`, `node:assert/strict`).
- Keep test names behavior-focused. Group setup, action and expectations so scenarios are easy to understand.
- Prefer assertions about exported behavior, state and failure handling over source-format snapshots.
- Test file paths and published asset references when changing static pages or CSS.
- Avoid test dependencies and unnecessary fixtures; keep invalid backup, storage failure and stale-tab cases explicit.
