## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader select a Progress backup, review how it differs from the current session, and explicitly replace existing progress. Reject invalid or incompatible files and stale previews without changing existing data.

## Acceptance criteria

- [ ] An accessible Import Progress control reads a selected CSV file and validates the supported schema, fifth edition, recognized catalog revision, field shapes, known Challenge IDs, and consistent variable awards before proposing any mutation. Other file formats are rejected.
- [ ] Reject duplicate or missing Challenge rows, unknown IDs, unsupported revisions, malformed CSV, invalid award types/ranges, missing required awards, and awards on incomplete/fixed-reward entries. Do not coerce strings, guess awards, or silently discard unsupported state.
- [ ] A valid preview shows current and incoming completed counts, total XP, Character level, and any supported catalog-revision effects. Clearly state that confirmation replaces rather than merges progress. If current saved statistics cannot be recovered, label them unavailable.
- [ ] Canceling, invalid selection, and rejected files preserve both session and stored data. Error messages explain the problem in terms a beginner can understand.
- [ ] Confirmation rechecks the saved state using the protected coordination boundary before replacement. Reject a preview made stale by another tab and require a fresh review against the latest state.
- [ ] Successful confirmation adopts the imported completion/award state, recalculates all statistics, and saves it safely. In session-only mode or after save failure, adopt only the confirmed session replacement, preserve the last saved record, retain the unsaved warning, and keep export usable.
- [ ] The initial MVP only recognizes its initial catalog revision. Do not implement speculative migrations; future supported revisions must provide explicit review and account for affected completions without silent loss.
- [ ] Public-boundary tests cover valid round trips, empty backups, selected variable awards, replacement/cancel, the full invalid-file matrix, unchanged data after rejection, unsaved operation, and changes between preview and confirmation.
- [ ] A browser check verifies file selection, accessible preview/cancel/confirm interaction, correct restored dashboard, and stale-preview protection across tabs.

## Blocked by

- [#5 — Keep progress across refresh without losing newer saves](https://github.com/lfarci/csharp-quest-tracker/issues/5)
