## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader recover explicitly when saved progress is corrupted or incompatible, keeping the original available until a replacement is chosen. Provide the complete recovery journey through raw-data download, valid backup import, and confirmed fresh start.

## Acceptance criteria

- [ ] Invalid saved JSON, unsupported schemas/editions/revisions, and inconsistent completion/award records enter an understandable recovery state without silently replacing data with empty progress.
- [ ] Preserve the original stored contents and offer a download. Label this as recovery data rather than a validated Progress backup.
- [ ] Where trustworthy current statistics cannot be derived, display them as unavailable; do not present zero as successfully recovered progress.
- [ ] Recovery can reuse the validated import preview/confirmation flow to restore a compatible backup. Canceling or rejecting the backup leaves the original stored record untouched.
- [ ] Offer an explicitly confirmed fresh start. Cancel leaves the original unchanged; confirmation initializes empty completion/award state and zero/level-1 statistics through the same coordinated-write protocol.
- [ ] Downloading the original data does not mutate it. Detect concurrent replacement by another tab before an import or fresh-start confirmation, and require reload or renewed review instead of overwriting newer data.
- [ ] If a recovery write cannot persist, preserve the original saved record and show the confirmed session state with a persistent unsaved warning and working export. Never claim the browser record was successfully repaired when writing failed.
- [ ] Behavioral tests compare raw stored contents before/after download, cancel, invalid import, confirmed replacement, write failure, and stale recovery actions. Browser checks exercise every recovery choice with accessible controls and status feedback.

## Blocked by

- [#6 — Import reviewed backups without damaging existing progress](https://github.com/lfarci/csharp-quest-tracker/issues/6)
