# Issue #4 implementation handoff

Issue: [Export a portable progress backup](https://github.com/lfarci/csharp-quest-tracker/issues/4).

`createProgressSession().exportBackup()` returns `{ filename, contents }` from the current in-memory state. It writes the agreed schema version, edition, catalog revision, distinct completed IDs, any selected variable reward, and an ISO `exportedAt`. Derived dashboard values, pending dialog state, storage data and unrelated browser information stay out of the export. The action does not mutate the session or access storage.

`src/backup-download.js` turns the record into a local JSON Blob download and revokes its temporary object URL. The accessible Export Progress control announces the downloaded filename or an understandable failure. Nearby copy explains browser-data loss and manual transfer; import is identified as a later slice while the ticket graph is in progress.

The built-in Node suite tests empty export, valid timestamp/filename, unchanged progress, forbidden derived fields, selected variable reward, duplicate completions, and export while award selection is pending. Those behavior scenarios use a small representative catalog, separately from full production-catalog verification.

Chromium 153.0.8010.12 checks passed through the actual control: an empty backup downloads and parses, then a mixed fixed/variable backup includes `hello-world` and `making-it-yours` with the exact 237 XP award. The visible XP remains 287 XP after download. The second download succeeds after the loaded page is disconnected and causes no network requests. The script and downloaded samples are outside the repository under `/tmp/csharp-quest-browser`.

The application remains browser-session-only until issue #5; exported backups remain the independent portable copy in this slice. Nothing was pushed or deployed.
