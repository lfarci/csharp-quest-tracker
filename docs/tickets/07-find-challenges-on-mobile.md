## Parent

[Build the fifth-edition C# Quest Tracker MVP — #1](https://github.com/lfarci/csharp-quest-tracker/issues/1)

## What to build

Let a reader quickly locate and complete a Challenge using title search and completion filters on desktop, tablet, or mobile. Make the checklist and dashboard readable and comfortable in the system's light/dark theme without changing progress semantics.

## Acceptance criteria

- [ ] Add All, Completed, and Remaining filters and title search. Combine their effects on the visible checklist while preserving official order and meaningful Book-part groupings; show an understandable empty result state.
- [ ] Completing or unchecking a visible Challenge updates the filtered view appropriately while leaving focus and interaction usable. All completion behavior continues through the public progress-session interface.
- [ ] Search and filters never change XP, Character level, completed totals, or the all-entry Tracker completion denominator. These view controls do not become independent persisted progress data.
- [ ] Use a restrained fantasy/RPG appearance with readable typography and verified Boss Battle distinctions, accessible contrast, visible focus, semantic controls/progress/status messages, and touch-friendly targets.
- [ ] Respect the system light/dark preference. The dashboard, checklist, search, filters, and shared action/status components fit small screens without losing labels, controls, or readable statistics.
- [ ] Keep required UI assets local and avoid framework/runtime dependencies, remote fonts, or animation libraries. Once ready, the search/filter/complete path works after disconnection.
- [ ] Test observable filtering/search/order behavior, empty results, live completion changes, and unchanged dashboard totals through the public boundary.
- [ ] Demonstrate finding and completing a Challenge with the keyboard and on a small-screen layout. Check screen-reader names/status feedback, focus behavior, both themes, and touch interaction; apply baseline accessible component conventions to subsequent flows as they are added.

## Blocked by

- [#2 — Track fixed-reward Challenges and Character level](https://github.com/lfarci/csharp-quest-tracker/issues/2)
