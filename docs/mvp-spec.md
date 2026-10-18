# C# Quest Tracker MVP

Status: detailed design reference consolidated from the user's brief and accepted interview decisions. At the user's request, the design was synthesized into the [issue specification](mvp-issue-spec.md) and published as [GitHub issue #1](https://github.com/lfarci/csharp-quest-tracker/issues/1) with the `ready-for-agent` label. Application implementation has not started.

## Purpose and scope

Build a lightweight, unofficial companion to The C# Player's Guide, fifth edition. Readers self-report challenge completion, earn the book's XP, and see their character level and tracker completion. Beginners need no account, setup, or programming knowledge to use the tracker. Mentors can review a learner's tracker with them; separate profiles, mentor accounts, and remote monitoring are outside the MVP.

Use HTML, CSS, vanilla JavaScript ES modules, static JSON catalogs, and localStorage. There is no build step, backend, database, authentication, or runtime dependency. Host the static site on GitHub Pages. Use built-in Node.js testing capabilities for business logic where practical.

Exclude automatic synchronization, GitHub integration, code editing or execution, grading, leaderboards, social features, streaks, custom achievements, multiple profiles, service workers, PWA installation, and complex animation frameworks.

## Catalog authority and presentation

The [official fifth-edition PDF tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf) determines challenge membership, titles, order, rewards, and character-level thresholds. Include its optional in-book expansions and appendix checks. Separately published supplements do not add entries to this catalog.

Mirror the PDF's five Parts and show each challenge's page number. This replaces primary grouping by book chapter from the original brief. Show book-level and challenge-type labels only where verified from the book or official supporting resources. Those resources may supply missing metadata but must not silently override the PDF's authoritative fields. Do not infer duplicate rewards from multiple solution pages.

Every catalog entry needs a stable unique identifier, title, part, page, reward definition, and order. Verified book-level labels may be numeric or lettered, including A, B, and C. Missing supplemental chapter/type metadata must not remove a PDF entry or prevent it being tracked. Preserve verified distinctions such as Knowledge Check, Boss Battle, Core Game, and Expansion without guessing absent classifications.

Give the catalog an immutable revision identifier independent of both book edition and backup schema version. IDs must remain stable across application releases, including when a title correction is proposed. Validate the catalog for unique IDs, valid reward definitions, and consistent ordering. Verify all authoritative fields against the PDF before release.

## Completion and XP

Completion is binary and self-reported. Readers may complete entries in any order, without prerequisites or grading. Each distinct completed fixed-reward entry contributes its catalog XP exactly once. Unchecking it removes that contribution.

“Expansion: Making it Yours” is the single variable-reward exception. The PDF displays `?`; the user supplied the book's **50–400 XP** range. Public primary sources checked did not independently establish the range or a selection formula. The agreed application rule is to ask the reader to choose any whole-number award from 50 through 400, inclusive, when completing it.

- Display the official `?` notation with an explanation of the permitted range; show the selected award when complete.
- Completing the entry requires a valid award. Canceling the prompt leaves the entry incomplete.
- Persist the individual award and include it in backups.
- Unchecking removes both completion and its selected award. Rechecking asks for a new amount.
- The range does not introduce partial completion, awards for other entries, or a general custom-XP feature.

Total XP is always derived from distinct completed IDs and their applicable rewards. Never store or import total XP or character level as authoritative mutable state.

## Dashboard

Show total XP, character level, next-level XP remaining and progress, completed challenge count, and **Tracker completion**. Filters and search affect the visible list only; all dashboard statistics describe the full catalog.

Tracker completion is the number of distinct completed catalog entries divided by the total number of catalog entries. It includes the variable-reward entry, optional expansions, and appendix checks. It measures completed tracker entries, not mastery or a required reading path.

Use the PDF's cumulative character-level thresholds:

| Character level | Minimum total XP |
| --- | ---: |
| 1 | 0 |
| 2 | 200 |
| 3 | 600 |
| 4 | 1,200 |
| 5 | 2,000 |
| 6 | 3,000 |
| 7 | 4,200 |
| 8 | 5,600 |
| 9 | 7,200 |
| 10 | 9,000 |

Below level 10, calculate progress within the current interval, rather than dividing total XP by the next cumulative threshold. At level 10, display “Maximum level” with a full progress indicator and no fictitious next-level target; total XP can continue increasing. Unchecking a challenge recalculates all statistics and may lower the character level. Always distinguish Book level from Character level.

## Progress format

Use a versioned key such as `csharp-quest-tracker:v1`. The following concrete shape implements the agreed state requirements; field names and the initial catalog revision label are implementation conventions, not additional user preferences.

```json
{
  "schemaVersion": 1,
  "bookEdition": 5,
  "catalogRevision": "fifth-edition:1",
  "completedChallengeIds": ["making-it-yours"],
  "variableXpAwards": {
    "making-it-yours": 150
  }
}
```

`making-it-yours` is the reserved stable ID for the variable-reward entry. An empty record has an empty completed-ID list and an empty award object. The award object may contain only a valid award for a completed variable-reward entry; fixed rewards remain catalog data. The 150 XP shown here is an example, not a default or recommended award.

Export the same core record in a timestamped CSV with one row per catalog Challenge, using a descriptive `.csv` filename. Include the schema version, book edition, catalog revision, `exportedAt`, Challenge ID and title, completion state, and selected variable award. Exclude derived totals and internal browser coordination state. Import CSV backups only. Transfers between devices are manual; nothing synchronizes automatically or sends progress to a server.

## Validation and import

Validate stored progress and imports before adopting them. Reject unsupported schema versions, incompatible editions, unrecognized catalog revisions, malformed fields, unknown challenge IDs, and invalid variable awards. A completed variable-reward entry must have an integer award in range; an incomplete one must not retain an award. No imported value may override a fixed catalog reward. Treat completion IDs as a set so duplicate IDs can never multiply XP.

An invalid import must leave both the current session and stored progress unchanged. Never silently drop unknown entries, guess an award, coerce invalid reward strings into numbers, or adopt an unsupported catalog revision.

After validating a file, show current and incoming completed counts, total XP, character level, and any supported migration effects. Clearly explain that confirmation replaces existing progress. Canceling leaves progress unchanged. On confirmation, ensure the saved state has not changed since the preview before replacing it. A stale preview must be reviewed again against the latest state.

If storage is unavailable, a confirmed import can replace the session state while retaining the persistent unsaved warning and export capability. A failed persistent write must not be reported as a successful save.

## Catalog changes

Do not silently adopt a catalog correction that changes a reader's XP, character level, or tracker completion. Preserve completed identifiers, show the effect of a supported revision change, and require explicit review before adoption. Until that decision, preserve the saved record and keep backup export available; do not overwrite it with the new revision.

The initial MVP needs only its first recognized catalog revision. A later release that changes rewards or membership must provide the prior catalog information needed to explain the change and a supported migration where applicable. Unknown revisions are rejected without altering progress. Any migration must account explicitly for affected completed identifiers; no silent removal is allowed.

## Persistence, recovery, and multiple tabs

Load and validate saved progress when the application starts. Missing progress starts at zero XP, character level 1, and zero completed challenges. Save after each accepted change when safe persistence is available.

If localStorage access is blocked or a write fails, keep the application usable for session tracking, display a persistent “Progress isn't saved” message, and keep export usable. Preserve any last successfully stored data. Do not silently clear the warning or report success before a save actually succeeds.

Invalid or incompatible stored data requires recovery before replacement. Preserve its original contents and explain the problem. Offer downloading that original data, importing a valid backup, or explicitly confirming a fresh start. A raw recovery download is not represented as a validated progress backup. If current statistics cannot be recovered reliably, label them unavailable rather than presenting zero as the reader's recovered progress.

All application writes, imports, resets, and migrations must participate in the same native browser coordination protocol. Use an exclusive Web Lock and compare the current saved state to the tab's accepted state inside the lock before writing. Storage events can notify a tab that it is stale, but are not sufficient to prevent races by themselves. Require stale tabs to reload before editing again.

If native coordination is unavailable or fails, use visibly unsaved session-only tracking with export. Feature-detect the capability and handle failures; the existence of localStorage alone does not establish safe persistence. Coordination protects cooperating application tabs; it cannot prevent another script or external tool from directly modifying browser storage.

## Interface and offline boundary

Provide title search and All, Completed, and Remaining filters while preserving catalog order. Use clearly labeled, touch-friendly checkboxes and buttons. Give verified Boss Battles distinct styling. Use a restrained fantasy/RPG aesthetic, readable typography, accessible contrast, keyboard operation, visible focus, accessible progress indicators, and comprehensible status/error messages. Use the system light/dark preference and a responsive layout without complex animation dependencies.

Load the catalog and all resources required for tracking before presenting the app as ready. An already-loaded tab must remain usable after the connection is lost, including filtering, completion, statistics, and backups. Avoid later network dependencies such as remotely fetched UI assets. Offline refresh, reopening, and installation are outside the MVP guarantee.

The browser's retained storage is the normal persistence mechanism, while timestamped CSV export is the manual backup and transfer mechanism. Export one row per catalog Challenge, including its stable ID, title, completion state, and selected variable award, along with the schema version, book edition, catalog revision, and export timestamp. Keep derived XP, Character level, and browser coordination data out of the file. Import validates the complete CSV before showing a replacement preview. Explain that clearing site data or losing browser storage can remove saved progress. No account or automatic cloud recovery is implied.

## Validation and acceptance

Keep business logic separate from DOM code. Use built-in Node.js tests for the logic and focused browser checks for interactions that depend on actual browser behavior.

- Fixed rewards, duplicate completion, unchecking, and derived statistics behave correctly.
- Every character-level threshold works at the boundary and just below it; maximum-level behavior is correct.
- Variable awards accept the inclusive bounds and reject out-of-range, fractional, missing, and incorrectly typed awards. Canceling, unchecking, and rechecking behave as specified.
- Tracker completion uses all catalog entries and remains independent of filters and search.
- Saved progress survives a normal refresh; valid backups round-trip without changing completed IDs or selected awards.
- Invalid files, unknown revisions or IDs, incompatible editions, and canceled imports leave existing progress unchanged.
- Corrupted storage is preserved until explicit recovery. Storage-access and write failures leave tracking and export usable with an unsaved warning.
- Simultaneous cooperating tabs cannot silently overwrite a newer saved state. Stale import previews are rejected, and missing lock support uses the agreed fallback.
- Supported catalog changes require an explicit review of their effects.
- Keyboard, small-screen layout, light/dark appearance, focus behavior, and accessible labels/status messages are checked in the browser.
- An already-loaded tab works after disconnection; no offline-reload guarantee is claimed.

The public MVP is complete when a reader can open the hosted site without registration, browse and search the PDF's entries in order, toggle completion, see accurate XP and character levels, retain progress on refresh where safe storage is available, transfer a backup to another device, and use the tracker comfortably on mobile.

## Attribution, licensing, and release work

Use MIT for original application code. Document rights and attribution for book metadata separately; selecting MIT does not establish the right to relicense third-party content. Include an unofficial-companion statement and clearly state that the project is not affiliated with or endorsed by RB Whitaker. Link to the [official book website](https://csharpplayersguide.com/).

Only reproduce the metadata needed for tracking. Do not include full exercise instructions, substantial passages, or solution code.

Before public release, verify the catalog against the PDF and document the basis for metadata reuse. The latter remains unresolved: research did not establish an explicit metadata reuse license. This interview does not authorize contacting the author or publishing the site. Resolve release evidence and complete the implementation before any deployment approval step.

## Supporting records

- [Glossary](../GLOSSARY.md)
- [Accepted interview decisions](design-decisions.md)
- [Browser-local progress and manual transfer](adr/0001-browser-local-progress-and-manual-transfer.md)
- [Official PDF as catalog authority](adr/0002-official-pdf-tracker-is-authoritative.md)
- [Independent catalog revisions](adr/0003-version-catalogs-independently-of-backup-schemas.md)
- [CSV progress backups](adr/0005-csv-progress-backups.md)
- [Coordinated browser writes](adr/0004-coordinate-browser-writes-and-fall-back-to-session-progress.md)
