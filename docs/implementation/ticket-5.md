# Issue #5 implementation handoff

Issue: [Keep progress across refresh without losing newer saves](https://github.com/lfarci/csharp-quest-tracker/issues/5).

`src/browser-progress.js` wraps the public progress session with browser persistence under `csharp-quest-tracker:progress:v1`. It validates edition, catalog revision, schema, completion IDs, awards, and the private write identity when restoring. It persists only the agreed progress record plus an internal identity; XP and Character level continue to come from the catalog. Backups remain free of browser coordination data.

Every accepted edit runs through one queued write boundary. The boundary holds the exclusive `csharp-quest-tracker:progress` Web Lock, compares the current raw localStorage value with the tab's accepted value, applies the user intention, then writes the next record. Each successful save gets a fresh identity, including an ABA change that returns to earlier progress. The shared `protectedWrite` entry point lets import and recovery use that same comparison/write protocol. Storage events promptly stale and disable an idle tab; the protected read still rejects stale writes if event delivery is delayed.

Unavailable storage, Web Locks, lock acquisition, or a later write leave the session usable with a persistent unsaved message and export. A failed write leaves the last stored record untouched and a later successful edit can save the current session. Invalid or incompatible data is preserved exactly, editing is blocked, and statistics are labeled unavailable until the recovery slice provides replacement controls.

The built-in Node suite has 40 passing tests. Controlled adapter cases cover restore, selected awards, rapid same-tab intents, stale protected writes without notifications, stale storage events, write/read/lock failures, invalid-record preservation, and the reusable protected boundary. Chromium checks in `/tmp/csharp-quest-browser` passed: refresh restored fixed and 237-XP variable progress at 287 total XP; a same-origin second page received a storage event and had editing disabled; an already-loaded page saved and exported while offline; an injected missing `navigator.locks` capability kept session progress exportable with an unsaved warning; and malformed stored data stayed unchanged with statistics unavailable and edits blocked. The app makes no progress-related network requests after loading.

The browser implementation was exercised locally with Chromium 153.0.8010.12. Nothing was pushed or deployed.
