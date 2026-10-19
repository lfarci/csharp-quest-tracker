# JavaScript source conventions

- Use plain JavaScript ES modules and two-space indentation; avoid frameworks, transpilation and runtime dependencies.
- Keep functions short, cohesive, and focused on a single responsibility; extract small helpers when that makes validation or flow easier to follow.
- Keep calculations and validation predicates pure whenever possible. Isolate necessary side effects to browser storage, DOM, download and event-handling boundaries.
- Prefer descriptive names, explicit guards, readable object literals and whitespace between logical blocks. Avoid chaining complex state transitions into single lines.
- Follow DRY and KISS: reuse meaningful logic, avoid duplication, speculative abstractions and overly clever syntax.
- Explain subtle behavior and architectural constraints in comments; do not narrate obvious statements.
- Keep progress rules and XP calculations in `progress-session.js`, browser persistence and stale-tab handling in `browser-progress.js`, and DOM event wiring in UI modules.
- Preserve storage-failure recovery, accessible status announcements, focus behavior and asynchronous error paths.
- Prefer platform APIs supported in the current major browsers; use feature detection and a clear fallback when an API is unavailable.
- Do not introduce dependencies or polyfills just to support obsolete browsers.
- Add or update tests for any observable behavior change.
