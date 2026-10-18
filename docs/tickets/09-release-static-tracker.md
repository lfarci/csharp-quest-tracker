## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Deliver the integrated tracker as a publicly accessible static GitHub Pages site, with verified catalog fidelity, complete user-facing guidance, and demonstrated browser behavior. Complete release preparation before requesting the separate deployment authorization required by the parent specification.

## Acceptance criteria

- [ ] Reconcile the implementation against the parent specification and the completed feature slices. Run the focused behavior checks and fix any integration failures in the relevant user flows; do not replace meaningful checks with implementation-shaped tests or an unrelated redesign.
- [ ] Independently verify the production catalog's membership, titles, order, page references, fixed rewards, variable notation/range handling, stable IDs, and Character-level thresholds against the agreed sources. Supplemental metadata remains verified and optional.
- [ ] Confirm that documented metadata-reuse evidence satisfies the separate prerequisite and apply its conditions. Include original-code MIT licensing, distinct metadata rights, attribution, official-book links, and the unofficial/non-endorsed statement. If the prerequisite remains unresolved, do not publish publicly.
- [ ] Document normal use, exact fifth-edition scope, 50–400 XP selection, Tracker completion's all-entry meaning, manual JSON transfer, storage-loss/recovery behavior, stale-tab reloads, and session-only fallback. Explain that offline use covers an already-loaded tab and that reopening/refreshing offline is not guaranteed.
- [ ] Check the integrated desktop/mobile and light/dark experiences, including keyboard/screen-reader behavior and the backup, award, import, recovery, and warning flows. Fix material accessibility or layout problems in those paths before release.
- [ ] Verify actual browser refresh retention, downloads/uploads, simultaneous-tab protection, stale import/recovery confirmation handling, unavailable storage/coordination fallback, and complete loaded-session behavior after disconnection.
- [ ] Prepare GitHub Pages hosting that serves the static application and local assets directly, including correct project-site asset URLs, with no compilation step, backend, account requirement, runtime dependencies, or recurring paid infrastructure.
- [ ] Complete the reviewable implementation and release evidence before requesting explicit deployment authorization. Ticket publication alone does not authorize deployment or outgoing messages to the author.
- [ ] After authorization, publish and verify the public URL: a reader can open without registration, browse/search official entries, complete/uncomplete fixed and variable Challenges, see accurate statistics, retain progress where safe persistence is supported, transfer a backup, and use the app on mobile. Record the URL and validation results without closing or editing the parent issue as part of this ticket workflow.

## Blocked by

- [#7 — Recover damaged stored progress explicitly](https://github.com/lfarci/csharp-quest-tracker/issues/7)
- [#8 — Find and complete Challenges comfortably on mobile](https://github.com/lfarci/csharp-quest-tracker/issues/8)
- [#9 — Establish the book-metadata reuse basis](https://github.com/lfarci/csharp-quest-tracker/issues/9)
