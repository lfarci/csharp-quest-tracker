## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader retain progress across a normal refresh while preventing cooperating tabs from silently overwriting newer saves. When storage or safe coordination is unavailable, preserve session tracking and export with an accurate unsaved warning.

## Acceptance criteria

- [ ] Save accepted completion and award changes under a versioned localStorage key using the parent's schema/edition/catalog-revision contract. Restore and validate saved state on load; a missing record starts a new empty session.
- [ ] Persist selected variable awards, never mutable XP or Character-level totals. Refresh reconstructs the same completions, award, and derived dashboard.
- [ ] Coordinate every participating write with one native exclusive lock protocol and compare current saved data to the tab's accepted state inside the lock before replacing it. Expose the same protected write boundary for later imports and recovery actions.
- [ ] Detect external changes and require stale tabs to reload before editing again. Storage notifications alone must not be treated as race prevention. Explain the reload requirement clearly.
- [ ] Feature-detect safe native coordination and handle storage access, lock-acquisition, and write failures. Fall back to session tracking/export with a persistent “Progress isn't saved” message; preserve the last successful stored record and do not report failed writes as saved.
- [ ] Preserve invalid, incompatible, and unknown-revision stored data without overwriting it. Show a recovery-needed state with unavailable statistics where appropriate; the complete download/import/reset recovery flow is delivered by its later slice.
- [ ] Never transmit progress to a server. An already-loaded tab can change completion, recalculate statistics, and export after disconnection.
- [ ] Public-boundary tests use controlled storage/coordination adapters to prove restoration, preservation on failures, selected-award consistency, and rejection of stale writes under deliberate simultaneous scheduling.
- [ ] Real-browser checks verify normal refresh restoration, simultaneous cooperating tabs, stale-tab blocking, missing-capability fallback, and persistence behavior after disconnection. Keep this slice's controls keyboard accessible.

## Blocked by

- [#4 — Export a portable progress backup](https://github.com/lfarci/csharp-quest-tracker/issues/4)
