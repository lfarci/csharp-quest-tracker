# Issue #6 implementation handoff

Issue: [Import reviewed backups without damaging existing progress](https://github.com/lfarci/csharp-quest-tracker/issues/6).

At initial implementation, the accessible file picker accepted a validated JSON backup and opened a native review dialog with current and incoming completed counts, XP, and Character levels. The dialog states that import replaces progress, and names the matching edition and catalog revision. Invalid JSON, unsupported fields/schema, incompatible edition/revision, unknown IDs, and inconsistent or invalid awards are rejected before mutation. Duplicate IDs are treated as a set. Cancel closes the review without changing progress or storage. The current importer accepts CSV files only under [ADR 0005](../adr/0005-csv-progress-backups.md).

`previewImport` captures the current tab generation and accepted persisted value. `confirmImport` checks the preview again inside the same protected lock used by completion edits, then replaces progress and derives dashboard values from the catalog. A same-tab edit invalidates its preview; another tab's newer write is rejected even if its storage event has not arrived. When current saved progress is damaged or unreadable, the preview labels its statistics unavailable. A confirmed replacement can recover the session; if its save fails, the confirmed progress remains exportable in memory while the prior saved bytes stay intact and the unsaved message remains visible.

The Node suite has 48 passing tests across the combined slices, including the invalid-backup matrix, duplicate IDs, replacement/cancel, stale previews, unknown current statistics, and session-only/failed-write imports. Chromium 153.0.8010.12 checks in `/tmp/csharp-quest-browser/import-real-browser.mjs` used an actual downloaded JSON file and file input: current/incoming totals were shown, cancel preserved state, confirmation restored 287 XP including the selected 237-XP award, and a preview was rejected after a second tab changed saved progress.

Nothing was pushed or deployed.
