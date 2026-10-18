# Issue #2 implementation handoff

Issue: [Track fixed-reward Challenges and Character level](https://github.com/lfarci/csharp-quest-tracker/issues/2).

## Application and verification

Run `python3 -m http.server 8000` from the repository and open `http://localhost:8000`. There is no build step or runtime dependency. Run `npm test` or `node --test` for the built-in Node.js suite.

The initial design uses a navy progress dashboard, quiet white checklist rows, gold progress indicators, Georgia for the title/Character level, and system UI fonts for controls. The checklist preserves official book order. Full-row checkbox labels, visible focus, skip navigation, native progress semantics, a polite completion status, mobile layout, and system dark mode provide the baseline for the later discovery/polish slice.

TDD ran through initial progress, fixed completion/unchecking, duplicate identifiers, unsupported commands, invalid catalogs, and view ownership. Sixteen behavioral tests pass, including every exact Character level threshold and its preceding XP value, the complete fixed catalog at 11,700 XP, and downward recalculation.

Focused Chromium checks passed at desktop and 360-pixel mobile sizes: 114 checkboxes, zero initial progress, disabled variable-reward entry, checking/unchecking with correct dashboard updates, keyboard Space, no post-ready network requests while offline, session-only reset on refresh, no horizontal overflow, system dark mode, no JavaScript errors, and an invalid catalog producing a visible error with the tracker hidden. Screenshots were visually reviewed. The local smoke script and screenshots were saved outside the repo under `/tmp/csharp-quest-browser/ticket2-*`; they are supporting session artifacts, not runtime dependencies.

Catalog source checks and the independent verification are recorded in [catalog-verification.md](../catalog-verification.md). No source PDF is redistributed. No catalog or site has been pushed/deployed; metadata reuse remains unresolved.

## Public progress-session boundary

`src/progress-session.js` exports `createProgressSession({ catalog, progress = {} })`.

- `setCompletion(id, boolean)` changes one fixed-reward Challenge. Unknown IDs, non-boolean values, and the variable-reward entry throw without changing progress.
- `getView()` returns `{ dashboard, parts }`. Dashboard fields are `totalXp`, `characterLevel`, `completedCount`, `challengeCount`, `trackerCompletion` (0–1), `xpRemaining` (`null` at maximum), `levelProgress` (0–1), and `maximumLevel`. Each part contains catalog metadata and `challenges`, each with a `completed` boolean. Returned records do not expose mutable authoritative catalog rewards.
- `getProgress()` returns `schemaVersion: 1`, `bookEdition: 5`, `catalogRevision: '5e-2026-10-18'`, distinct `completedChallengeIds`, and `variableXpAwards: {}`. Derived totals are never stored as authoritative state.
- The optional initial `progress.completedChallengeIds` is used by the agreed seam to demonstrate duplicate set semantics. External record/schema validation belongs to the later persistence/import slices; the UI currently initializes only an empty session.

`src/catalog.js` validates the catalog before session construction. `src/app.js` fetches the entire catalog once, creates the session, builds the DOM, and updates dashboard/status without rebuilding focused checkboxes. `data/catalog.json` contains five parts, the exact threshold ladder, and 114 ordered Challenges. Fixed rewards use `{ kind: 'fixed', xp }`; the variable reward uses `{ kind: 'variable', notation: '?', minimum: 50, maximum: 400 }`.

This slice intentionally has no persistence, backup, filtering, or variable-award completion implementation. Its persistent notice accurately says progress resets on refresh. Those features follow the existing ticket graph.
