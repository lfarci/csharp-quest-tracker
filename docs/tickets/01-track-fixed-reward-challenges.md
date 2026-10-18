## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader open the static application, browse the official fifth-edition catalog in its five Book parts, and complete/uncomplete fixed-reward Challenges. Show an immediately recalculated dashboard with XP, Character level, next-level progress, completed count, and Tracker completion. This first slice is an explicitly session-only local demo; variable-reward completion arrives in the following slice.

## Acceptance criteria

- [ ] A static HTML/CSS/vanilla-JavaScript application runs without compilation, registration, a backend, or runtime dependencies. Load the required catalog/assets before presenting tracking as ready; catalog loading or validation failures produce an understandable state with no fabricated progress.
- [ ] The full official fifth-edition PDF catalog is transcribed and checked for membership, exact titles, order, page references, and reward definitions. Include optional expansions and appendix checks, stable unique IDs, an immutable initial catalog revision, and the reserved variable-reward ID from the parent spec. Do not publish the catalog publicly before the release-evidence prerequisite is complete.
- [ ] Show all catalog entries grouped by the PDF's five Book parts with page numbers; only add verified chapter/type labels. Keep the variable-reward entry visibly identified by `?` without awarding an invented reward or permitting unsupported completion before its follow-up slice.
- [ ] With no session progress, show zero XP, Character level 1, and zero completions. Readers can complete fixed-reward entries in any order and uncheck them; every distinct ID contributes exactly once.
- [ ] Calculate Character levels from the parent's exact official thresholds. Show progress within the current interval, downward recalculation on unchecking, and “Maximum level” at level 10 while XP can continue increasing.
- [ ] Calculate Tracker completion against every official catalog entry, including the variable-reward entry; distinguish it from Book level and Character level. Do not claim that the variable Challenge's completion flow is implemented in this slice.
- [ ] Use labeled keyboard-operable controls, visible focus, and understandable progress/status information. Make the session-only persistence limitation explicit; this slice must not claim to save progress across refresh.
- [ ] Expose behavior through the agreed public progress-session boundary, separate from DOM manipulation. Built-in Node.js tests cover observable fixed-completion behavior, duplicates, unchecking, counts, all level boundaries, and maximum-level behavior. Structural catalog checks do not substitute for source verification.
- [ ] Demonstrate opening the app, completing and unchecking a fixed-reward Challenge, and seeing the dashboard change without a network request after the app is ready.

## Blocked by

None (can start immediately).
