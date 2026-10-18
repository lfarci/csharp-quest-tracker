# Issue #7 implementation handoff

Issue: [Recover damaged stored progress explicitly](https://github.com/lfarci/csharp-quest-tracker/issues/7).

When stored progress is malformed, incompatible, or from an unknown schema/revision, the tracker preserves its exact original string, blocks checklist edits, and labels XP and Character statistics unavailable. Recovery offers three clear actions: download the original as a distinct `.txt` recovery-data file, import a compatible validated backup through the #6 review flow, or confirm a fresh start. The raw download does not parse, normalize, or mutate the stored value.

Fresh start has a native confirmation dialog that says the change replaces saved data with 0 XP, Character level 1, and no completed Challenges. Cancel leaves the original bytes untouched. Confirmation goes through the same exclusive Web Lock, accepted-raw comparison, and internal write identity as checklist edits and imports. A newer cross-tab value rejects the pending recovery action. If a confirmed replacement cannot be saved, the session remains usable and exportable with the unsaved warning while the original raw data stays available for download; recovery data availability ends only after a successful stored write.

The Node suite has 54 passing tests across the integrated slices. Recovery cases compare the exact stored raw text before and after download, cancellation, stale reset rejection, and failed persistence. Chromium 153.0.8010.12 checks in `/tmp/csharp-quest-browser/recovery-real-browser.mjs` verified exact raw download, canceled fresh start, backup-based repair with unavailable current statistics, successful confirmed fresh start, and stale reset rejection after a second tab wrote a newer record.

Nothing was pushed or deployed.
