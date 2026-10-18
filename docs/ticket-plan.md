# C# Quest Tracker ticket breakdown

Status: approved by the user and published as nine `ready-for-agent` sub-issues with native GitHub blocking relationships. Source: [MVP specification, issue #1](https://github.com/lfarci/csharp-quest-tracker/issues/1), including its full body and comments (none at drafting time).

Each implementation ticket delivers a user-visible flow through catalog/state, session behavior, DOM presentation, and focused behavioral checks as applicable. Accessibility, readable errors, and business-logic separation apply to each slice. The repository contains no implementation to prefactor. Ticket 08 is an independent release-evidence prerequisite, not an application feature; it stays separate so unresolved rights evidence does not block local implementation.

Draft numbers preserve the approved breakdown; the Issue column links to the published GitHub identifiers.

| Draft | Issue | Title | Blocked by | Deliverable |
| --- | --- | --- | --- | --- |
| 01 | [#2](https://github.com/lfarci/csharp-quest-tracker/issues/2) | Track fixed-reward Challenges and Character level | None | Browse the official catalog and complete/uncomplete fixed-reward entries with accurate session dashboard statistics. |
| 02 | [#3](https://github.com/lfarci/csharp-quest-tracker/issues/3) | Complete Making it Yours with its variable XP reward | [#2](https://github.com/lfarci/csharp-quest-tracker/issues/2) | Choose 50–400 XP, cancel safely, and clear/reselect the award through the real checklist. |
| 03 | [#4](https://github.com/lfarci/csharp-quest-tracker/issues/4) | Export a portable progress backup | [#3](https://github.com/lfarci/csharp-quest-tracker/issues/3) | Download a timestamped, versioned backup that preserves completed IDs and the selected variable award. |
| 04 | [#5](https://github.com/lfarci/csharp-quest-tracker/issues/5) | Keep progress across refresh without losing newer saves | [#4](https://github.com/lfarci/csharp-quest-tracker/issues/4) | Safely save/restore progress, coordinate multiple tabs, and retain session tracking/export when persistence is unavailable. |
| 05 | [#6](https://github.com/lfarci/csharp-quest-tracker/issues/6) | Import reviewed backups without damaging existing progress | [#5](https://github.com/lfarci/csharp-quest-tracker/issues/5) | Validate, preview, confirm, and persist replacement imports while rejecting invalid files and stale previews. |
| 06 | [#7](https://github.com/lfarci/csharp-quest-tracker/issues/7) | Recover damaged stored progress explicitly | [#6](https://github.com/lfarci/csharp-quest-tracker/issues/6) | Download original data, restore a valid backup, or confirm a fresh start without silently discarding the saved record. |
| 07 | [#8](https://github.com/lfarci/csharp-quest-tracker/issues/8) | Find and complete Challenges comfortably on mobile | [#2](https://github.com/lfarci/csharp-quest-tracker/issues/2) | Search/filter the checklist with stable totals, responsive layouts, system themes, and accessible interaction. |
| 08 | [#9](https://github.com/lfarci/csharp-quest-tracker/issues/9) | Establish the book-metadata reuse basis | None | Record verifiable reuse evidence and required attribution/licensing boundaries before public release. |
| 09 | [#10](https://github.com/lfarci/csharp-quest-tracker/issues/10) | Release the verified tracker on GitHub Pages | [#7](https://github.com/lfarci/csharp-quest-tracker/issues/7), [#8](https://github.com/lfarci/csharp-quest-tracker/issues/8), [#9](https://github.com/lfarci/csharp-quest-tracker/issues/9) | Verify the combined browser flows and official catalog, finish user/release documentation, and publish after deployment authorization. |

## Dependency rationale

- 02 uses 01's working checklist and session behavior.
- 03 depends on 02 so the first usable backup preserves all agreed completion state, including a reader-selected award.
- 04 depends on 03 because the agreed persistence-failure and missing-coordination fallback must keep export available.
- 05 depends on 04 because confirmed imports must use coordinated persistence and detect stale saved-state previews.
- 06 depends on 05 because valid-backup import is one of the required recovery paths; download/reset also use the existing safe-state boundary.
- 07 needs only the working checklist/session from 01; it does not wait on backup or persistence work.
- 08 has no implementation prerequisite and can start immediately. If no reuse basis is established, keep it incomplete and public release blocked.
- 09 has only the direct blockers 06, 07, and 08. The core, variable reward, export, persistence, and import slices are already transitively required through 06.

## Individual ticket records

1. [Track fixed-reward Challenges and Character level](tickets/01-track-fixed-reward-challenges.md)
2. [Complete Making it Yours with its variable XP reward](tickets/02-complete-variable-reward-challenge.md)
3. [Export a portable progress backup](tickets/03-export-progress-backup.md)
4. [Keep progress across refresh without losing newer saves](tickets/04-persist-progress-safely.md)
5. [Import reviewed backups without damaging existing progress](tickets/05-import-reviewed-backups.md)
6. [Recover damaged stored progress explicitly](tickets/06-recover-damaged-progress.md)
7. [Find and complete Challenges comfortably on mobile](tickets/07-find-challenges-on-mobile.md)
8. [Establish the book-metadata reuse basis](tickets/08-establish-metadata-reuse-basis.md)
9. [Release the verified tracker on GitHub Pages](tickets/09-release-static-tracker.md)

## Ticket publication record

All nine approved tickets were published in blocker-first order as native sub-issues of #1 and labeled `ready-for-agent`. Each issue body, label, parent relationship, and exact set of native blockers was read back and verified. The parent issue's title, body, labels, and state were verified unchanged. Local ticket records retain readable blocker links; GitHub stores these as native relationships. The implementation is now on the local `integration/mvp` branch; see the ticket records and release preparation notes for current evidence. Public release is still blocked by issue #9.

The parent remains the source of scope and shared constraints. Every implementation slice uses the agreed public progress-session testing boundary, with real-browser checks for native platform behavior. The initial MVP supports its first catalog revision only; do not create speculative migration features or an extra migration ticket.

## Current release status

- [#9 — Establish the book-metadata reuse basis](https://github.com/lfarci/csharp-quest-tracker/issues/9)
- [#10 — Release the verified tracker on GitHub Pages](https://github.com/lfarci/csharp-quest-tracker/issues/10)

Feature slices #2–#8 have been implemented and integrated locally. Issue #9 remains unresolved, which blocks public Pages deployment. Issue #10 contains local release preparation and integrated verification; its public deployment acceptance criteria remain pending that rights prerequisite and separate deployment authorization.
