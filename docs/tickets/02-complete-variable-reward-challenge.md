## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader complete “Expansion: Making it Yours” by choosing the book-permitted Variable XP reward. Carry the selected amount through the real checklist, session state, and dashboard, while preserving binary completion.

## Acceptance criteria

- [ ] The official `?` reward notation is explained as an inclusive 50–400 XP range, using the user's book evidence recorded in the parent spec.
- [ ] Completing the Challenge asks for a whole-number award in that range. Do not choose a default award for the reader, impose undocumented increments, or add a general custom-XP feature.
- [ ] Canceling leaves the Challenge incomplete and all previous progress unchanged. Invalid, fractional, missing, out-of-range, and incorrectly typed awards cannot complete it or alter totals.
- [ ] On valid completion, show the selected award and include it exactly once in derived XP, Character level, completed count, and Tracker completion.
- [ ] Unchecking removes both completion and the selected award. Rechecking asks for a new amount; award data cannot remain on an incomplete entry or override fixed rewards.
- [ ] The selected award is represented in the progress-session state according to the parent contract, ready for export and persistence. Total XP and Character level remain derived values.
- [ ] Award selection, cancellation, validation feedback, and focus behavior work with the keyboard and expose understandable labels/status messages.
- [ ] Behavioral tests cover both inclusive bounds, an interior whole number, invalid cases, cancel, duplicate completion, uncheck/recheck, and changes that cross a Character-level threshold. Demonstrate the complete flow through the browser checklist.

## Blocked by

- [#2 — Track fixed-reward Challenges and Character level](https://github.com/lfarci/csharp-quest-tracker/issues/2)
