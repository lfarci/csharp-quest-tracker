## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader download a portable CSV Progress backup of the current session, including a selected Variable XP reward. Explain that moving progress between devices is a manual export/transfer/import process.

## Acceptance criteria

- [ ] An accessible Export Progress control downloads a descriptively named CSV file with one row per catalog Challenge, containing stable ID, title, completion state, selected variable award, supported schema version, fifth-edition identifier, recognized catalog revision, and ISO export timestamp.
- [ ] Empty progress and a session containing fixed and variable rewards both export successfully. The exported individual award matches the reader's selection.
- [ ] Backups contain no authoritative derived XP, Character level, browser coordination state, or unrelated browser data. Export does not mutate progress.
- [ ] The UI explains manual transfer and the value of backups when browser storage is cleared or unavailable, without implying automatic synchronization.
- [ ] All export behavior works from current in-memory progress and requires no network request, account, or persistent-storage write; later session-only fallbacks can reuse it.
- [ ] Public-boundary tests verify backup content, stable IDs, selected awards, empty-state behavior, timestamp validity, absence of forbidden derived/internal state, and unchanged session state. Do not use brittle exact snapshots for changing timestamps.
- [ ] A focused browser check verifies that the download control produces a readable file reflecting the displayed progress.

## Blocked by

- [#3 — Complete Making it Yours with its variable XP reward](https://github.com/lfarci/csharp-quest-tracker/issues/3)
