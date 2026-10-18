# Build the C# Quest Tracker MVP

## Problem Statement

Readers of The C# Player's Guide need a convenient way to record completed challenges and see their XP and character level without maintaining a paper tracker or calculating totals themselves. A beginner should be able to use the tracker immediately, retain progress in the browser, and transfer it to another device without registration or a hosted account.

The application must follow the fifth edition's official tracker, including its optional entries and variable reward, while keeping Book level, Character level, and Tracker completion distinct. Progress must remain understandable and recoverable when backups are invalid, storage fails, catalogs change, or multiple tabs are open.

## Solution

Create a small, accessible, responsive static website that mirrors the official fifth-edition PDF tracker. Readers check off Challenges, choose the book-permitted reward for the one variable-XP Challenge, and immediately see recalculated progress. Their progress stays in the browser and transfers manually through validated CSV export and replacement import.

Group Challenges by the PDF's five Book parts, preserve its order, and show page numbers. Include title search, completion filters, a restrained fantasy/RPG appearance, and system light/dark themes. An already-loaded tab continues working offline. Provide clear recovery and unsaved-state messages instead of silently discarding progress or overstating persistence guarantees.

## User Stories

1. As a reader, I want to open the tracker without registration or setup, so that I can start tracking immediately.
2. As a first-time reader, I want to begin with zero XP, Character level 1, and no completed Challenges, so that the initial state is clear.
3. As a fifth-edition reader, I want Challenge membership, titles, order, rewards, and leveling thresholds to match the official PDF tracker, so that my results follow the book.
4. As a reader, I want Challenges grouped into the PDF's five Book parts with page numbers, so that I can locate the activity I just finished.
5. As a reader, I want verified Book level and Challenge-type labels where available, so that supplementary information helps me navigate without introducing guessed metadata.
6. As a reader, I want optional in-book expansions and appendix checks included, so that every official tracker entry is available.
7. As a reader, I want to mark a Challenge complete with a checkbox, so that its reward counts toward my progress.
8. As a reader, I want to uncheck a Challenge, so that its reward is removed and my progress is recalculated.
9. As a reader, I want each completed Challenge to contribute XP only once, so that repeated actions or duplicate identifiers cannot inflate my results.
10. As a reader, I want to complete Challenges in any order, so that the tracker accommodates my chosen route through the book.
11. As a reader, I want completion to be self-reported without grading, so that the exercises remain in the book and my development environment.
12. As a reader, I want to choose a whole-number award from 50 through 400 XP for the Making it Yours Challenge, so that the tracker accommodates the book's variable reward.
13. As a reader, I want to cancel variable-award selection without completing the Challenge, so that an abandoned interaction does not change my progress.
14. As a reader, I want unchecking the variable-reward Challenge to remove its award and rechecking it to ask for a new amount, so that rewards remain tied to completion.
15. As a reader, I want the variable reward explained alongside the PDF's `?` notation and the selected amount shown when complete, so that I understand its contribution.
16. As a reader, I want total XP calculated from my completed Challenges and their applicable rewards, so that the total remains consistent.
17. As a reader, I want my Character level calculated automatically, so that I do not have to interpret thresholds myself.
18. As a reader below Character level 10, I want to see XP remaining and progress within my current level, so that I understand the next milestone.
19. As a reader at Character level 10, I want to see “Maximum level” while total XP continues accumulating, so that the tracker does not invent further levels.
20. As a reader, I want to see my completed Challenge count and Tracker completion, so that I can understand overall progress through all official entries.
21. As a reader, I want Tracker completion to include optional expansions and appendix checks, so that 100% has a stable meaning.
22. As a reader, I want Book level, Character level, and Tracker completion labeled distinctly, so that chapter placement, XP rank, and checklist coverage are not confused.
23. As a reader, I want All, Completed, and Remaining filters, so that I can focus on the Challenges relevant to me.
24. As a reader, I want to search Challenge titles while preserving book order, so that I can find a particular activity quickly.
25. As a reader, I want dashboard totals to stay independent of search and filters, so that narrowing the list does not change my overall results.
26. As a reader, I want each accepted change saved automatically when safe browser storage is available, so that refreshing restores my progress.
27. As a reader, I want an already-loaded tab to continue working after disconnection, so that tracking does not depend on ongoing internet access.
28. As a reader, I want the offline boundary explained clearly, so that I understand that offline reopening and refreshing are not guaranteed.
29. As a reader, I want progress kept locally and never sent to a server, so that using the tracker requires no hosted personal account.
30. As a reader, I want to export a timestamped CSV progress backup, so that I can preserve a readable copy independently of browser storage.
31. As a reader, I want backups to preserve my completed Challenges, book edition, catalog revision, and selected variable award, so that restoring recalculates the same results.
32. As a reader, I want to import a compatible backup on another device, so that I can transfer progress manually.
33. As a reader, I want the interface to explain that backup transfer is manual, so that I do not expect automatic synchronization.
34. As a reader importing progress, I want to compare existing and incoming completed counts, XP, Character level, and migration effects, so that I understand the replacement before confirming it.
35. As a reader, I want canceling an import to leave existing progress unchanged, so that reviewing a backup is safe.
36. As a reader, I want malformed or incompatible CSV backups, unsupported schemas, incompatible editions, unknown revisions, and unknown Challenge IDs rejected, so that unsupported files cannot damage my progress.
37. As a reader, I want missing, fractional, incorrectly typed, and out-of-range variable awards rejected, so that imported rewards follow the agreed rules.
38. As a reader, I want stale import previews rejected when another tab changes progress, so that confirmation cannot silently overwrite a newer record.
39. As a reader with corrupted stored progress, I want the original data preserved and downloadable, so that recovery remains possible.
40. As a reader with invalid stored progress, I want to restore a valid backup or explicitly confirm a fresh start, so that replacement is my choice.
41. As a reader whose stored statistics cannot be recovered, I want them labeled unavailable, so that an empty display is not mistaken for recovered zero progress.
42. As a reader when saving fails, I want tracking to continue for the current session with a persistent unsaved warning and working export, so that I can protect my latest work.
43. As a reader, I want the last successfully stored record preserved when a later save fails, so that failure does not erase the previous save.
44. As a reader using multiple tabs, I want stale tabs to stop editing until reloaded, so that an older view does not overwrite newer progress.
45. As a reader making simultaneous changes in cooperating tabs, I want writes coordinated safely, so that concurrent actions cannot silently lose progress.
46. As a reader in a browser without safe tab coordination, I want session-only tracking, a visible warning, and export, so that I can still use the application with an accurate persistence expectation.
47. As a returning reader after a catalog correction, I want to review changes to XP, Character level, and Tracker completion before adopting them, so that updates do not silently alter my results.
48. As a reader, I want stable Challenge identifiers and explicit treatment of affected completions during supported migrations, so that catalog maintenance does not silently drop my work.
49. As a keyboard user, I want labeled controls, visible focus, and operable completion and backup flows, so that I can use the entire tracker without a pointer.
50. As a screen-reader user, I want understandable progress indicators, validation messages, and status changes, so that I can follow my progress and recover from errors.
51. As a mobile or tablet reader, I want readable layouts and touch-friendly controls, so that I can track comfortably on a small screen.
52. As a reader, I want accessible contrast and my system's light/dark preference respected, so that the interface remains comfortable to read.
53. As a reader, I want verified Boss Battles visually distinguished within a restrained adventure theme, so that the tracker feels enjoyable without excessive gamification.
54. As a mentor, I want to review a learner's tracker with them, so that we can discuss progress without introducing mentor accounts or remote monitoring.
55. As a reader, I want the site to explain its unofficial status and link to the official book website, so that I understand its relationship to the author and book.
56. As a reader, I want browser-storage limitations and the value of manual backups explained, so that I understand what clearing site data can remove.
57. As a maintainer, I want a static application with no compilation step or runtime dependencies, so that one developer can maintain and host it simply.
58. As a maintainer, I want original application code licensed under MIT with book-metadata rights documented separately, so that contributors understand the project's licensing boundaries.
59. As a maintainer, I want catalog verification and metadata-reuse evidence completed before public release, so that release readiness reflects the agreed requirements.
60. As a reader, I want the completed tracker available as a publicly hosted static website, so that I can access it without installing development tools.

## Implementation Decisions

- Build a static HTML/CSS application using vanilla JavaScript ES modules and a static JSON catalog. Use localStorage for persistence and GitHub Pages for hosting. Introduce no build step, backend, database, authentication, framework, or runtime dependency.
- The repository currently contains a domain glossary, the interview decisions, a consolidated MVP description, and four ADRs. Application code and tests do not yet exist. Follow the glossary's canonical terms: Challenge, Book level, Book part, Character level, XP, Variable XP reward, Tracker completion, Catalog, Catalog revision, and Progress backup.
- Respect the ADR decisions to keep progress browser-local with manual transfer, use the official PDF as catalog authority, version catalogs independently of backup schemas, and coordinate browser writes with a session-only fallback.
- Introduce logical responsibilities for catalog loading/validation, a progress session that exposes application behavior, browser persistence/coordination, and DOM presentation. Prefer one public progress-session boundary for behavioral tests; internal module boundaries are implementation choices rather than separately prescribed test seams.
- The progress session should expose the observable operations needed to initialize progress, change completion, submit a variable award, derive the dashboard/list view, preview and confirm imports, export backups, and enter recovery. Browser-specific adapters supply persistence and coordination; the DOM layer presents results and collects input without owning independent XP totals.
- Use the official fifth-edition PDF tracker for membership, titles, order, page references, rewards, and leveling thresholds. Include its in-book expansions and appendix checks. Mirror its five Book parts. Supplemental chapter/type metadata may come from verified official sources but must not silently override authoritative PDF fields. Do not create extra XP entries from additional solution pages.
- Catalog entries require stable unique IDs, title, Book part, page, reward definition, and order. Supplementary Book level labels may be numeric or lettered, including A, B, and C. Missing verified chapter/type metadata must not prevent tracking a PDF entry. Validate unique IDs, reward definitions, and consistent ordering before use.
- Give every catalog an immutable revision identifier separate from book edition and backup schema version. Keep IDs stable when display titles change. The initial MVP only needs its first recognized revision; future revision changes require the prior information and supported migration needed to explain their effects.
- Completion is a set of distinct Challenge IDs. It is binary, self-reported, and unrestricted by prerequisite order. Completing an entry awards its fixed catalog reward once; unchecking removes it. Repeated actions or duplicate identifiers must not multiply XP.
- Preserve `?` as the official notation for “Expansion: Making it Yours.” The user supplied the book's inclusive 50–400 XP range, and agreed to reader selection of any whole number in that range. Require a valid award before completion, leave the entry incomplete when selection is canceled, preserve the chosen award in progress/backups, and delete it on unchecking. Rechecking prompts again. Do not introduce a default award or general custom-XP feature.
- Derive total XP from completed IDs and applicable rewards on every change. Derive Character level and dashboard statistics from that total and the catalog. Never store or adopt total XP or Character level as authoritative mutable state.
- Character levels 1 through 10 begin at cumulative totals of 0, 200, 600, 1,200, 2,000, 3,000, 4,200, 5,600, 7,200, and 9,000 XP. Below level 10, calculate remaining XP and progress within the current threshold interval. At level 10, show “Maximum level,” a full indicator, and no next-level target; total XP may continue increasing.
- Tracker completion is distinct completed entries divided by all catalog entries, including optional expansions, appendix checks, and the variable-reward entry. Label it “Tracker completion.” Search and filters change the visible list only, never the dashboard denominator or totals.
- Save under a versioned localStorage key. Persist only the backup schema version, book edition, catalog revision, completed Challenge IDs, and selected variable awards, together with any strictly internal state required for safe coordination. Exclude internal coordination data from exported backups.
- The agreed progress contract uses `schemaVersion`, `bookEdition`, `catalogRevision`, `completedChallengeIds`, and `variableXpAwards`. The award collection maps a completed variable-reward Challenge's ID to its selected integer award. It may not override fixed catalog rewards or retain awards for incomplete entries. Reserve the stable ID `making-it-yours` for the variable-reward Challenge. These field names and the initial revision token are concrete implementation conventions from the existing consolidated design.
- Export a timestamped CSV with one row per catalog Challenge and columns for the stable ID, title, completion state, and selected variable award. Include the supported schema version, book edition, catalog revision, and ISO `exportedAt` timestamp. Use a descriptive `.csv` filename. Exclude derived XP, Character level, and browser coordination state. Import CSV files only. Explain that transfer between devices requires exporting, transferring, and importing the file manually.
- Validate imports and stored records before adoption. Reject unsupported schemas, incompatible editions, unrecognized catalog revisions, malformed fields, unknown Challenge IDs, and invalid or inconsistent variable awards. Do not coerce invalid reward strings, guess missing awards, silently discard unknown completions, or trust imported derived totals. Duplicate IDs are interpreted as a set.
- Invalid imports must leave both session progress and stored data unchanged. Valid imports replace rather than merge progress, after showing current/incoming completed counts, XP, Character level, and supported migration effects. Canceling must not mutate progress. Confirmation must recheck the saved state against the preview's state before replacement; stale previews require a fresh review.
- On first visit with no saved record, initialize zero XP, Character level 1, and empty completion/award collections. Restore and validate saved progress on later loads. Save after each accepted change when safe persistence is available.
- Preserve invalid or incompatible stored data until explicit recovery. Offer a raw-data recovery download, a valid backup import, or a confirmed fresh start. Distinguish raw recovery data from a validated backup. If current statistics cannot be recovered reliably, label them unavailable instead of presenting zero as recovered progress.
- If storage access or writing fails, keep session tracking and export usable, preserve the last successfully stored data, and show a persistent “Progress isn't saved” message. A confirmed valid import may replace the unsaved session. Clear an unsaved warning only when persistence has actually succeeded; do not report a failed write as a save.
- All cooperating application writes, import confirmations, recovery resets, and migrations use the same exclusive native browser lock. Inside the lock, compare current stored data with the tab's accepted state before writing. Use storage notifications to detect stale tabs and require reload before further edits. A localStorage check/write pair without coordinated locking is insufficient protection against races.
- Feature-detect native coordination and handle access/acquisition failures. If safe coordination is unavailable, use visibly unsaved session-only tracking with export. The guarantee covers cooperating application tabs; external scripts or tools that bypass the protocol are outside that guarantee.
- Catalog corrections affecting XP, Character level, or Tracker completion require explicit before/after review before adoption. Preserve the saved record and backup capability until that decision. Recognized older revisions need a supported interpretation or migration; unknown revisions are rejected. No supported migration may silently drop affected completed IDs.
- Provide All, Completed, and Remaining filters and title search while preserving official order. Use readable typography, accessible contrast, semantic labeled controls, visible keyboard focus, touch-friendly targets, accessible progress/status messages, and responsive desktop/tablet/mobile layouts. Respect the system light/dark preference and distinguish verified Boss Battles without complex animation frameworks.
- Load all catalog data and assets required for tracking before declaring the application ready. An already-loaded tab must support completion, filtering, statistics, and backup operations without networking. Keep required UI assets local. Offline refreshing, reopening, and installation are outside the guarantee.
- Never transmit progress to a server. Explain browser-storage loss and manual backup responsibilities. Preserve the no-account, no-cloud-sync model and keep mentoring limited to reviewing the learner's tracker together.
- License original application code under MIT. Document book-metadata rights separately, reproduce only necessary tracking metadata, link to the official book website, and state that the tracker is unofficial and not affiliated with or endorsed by RB Whitaker.

## Testing Decisions

- Primary seam: test observable behavior through one public progress-session interface. Exercise real catalog validation, progress calculation, and backup validation behind that boundary, with controlled persistence and coordination adapters for failure and race scenarios. There is no existing application seam to reuse.
- Good tests assert outcomes visible to a reader or caller: resulting completions, chosen awards, dashboard values, exported records, warnings, recovery availability, and preservation of prior data. Avoid assertions about internal helper calls, private representations, DOM snapshots, or implementation-shaped mocks.
- Use the built-in Node.js test runner and assertions for the progress-session behavior. The repository has no existing tests or prior application testing conventions; do not claim established test patterns or introduce a testing framework without demonstrated need.
- Test initialization with missing, valid, invalid, incompatible, and inaccessible stored records. Verify invalid raw data remains available until explicit recovery and unreliable recovered statistics are labeled unavailable.
- Test fixed completion, repeated completion, duplicate IDs, unchecking, out-of-order completion, and consistent derived XP/count/percentage outcomes.
- Test every Character-level threshold at the boundary and immediately below it, progress within each interval, downward recalculation, level-10 presentation, and XP accumulation above 9,000.
- Test variable awards at the inclusive 50 and 400 bounds and an interior whole number. Reject missing, fractional, out-of-range, and incorrectly typed awards; reject awards on incomplete or fixed-reward entries. Verify cancel, uncheck, recheck, persistence, and backup round trips.
- Verify Tracker completion includes every catalog entry and that title search/completion filters preserve order without changing dashboard totals.
- Test valid export/import round trips, expected timestamped backup content, cancellation, replacement rather than merge, and preservation of selected awards. Assert derived totals and coordination state are not exported as authoritative progress.
- Test malformed CSV and legacy JSON, bad field shapes, unsupported schema versions, incompatible editions, unknown revisions, unknown IDs, and invalid awards. Compare both session state and stored data before/after rejection to prove no destructive mutation occurs.
- Test before/after import summaries and supported revision review at the same public boundary. Unknown revisions remain unchanged; any supported migration must account for affected completed IDs without silent loss. The initial revision needs no speculative migration implementation.
- Use controlled adapter failure scenarios to verify storage-access errors, failed writes, unavailable locks, and failed lock acquisition yield persistent warnings, usable session tracking/export, and preservation of the last saved record.
- Use controlled scheduling to verify stale completion saves, resets, migrations, and import confirmations do not overwrite a newer accepted record. Cover a saved-state change between preview and confirmation, plus the inside-lock state comparison.
- Add focused real-browser checks for platform behavior that controlled adapters cannot establish: refresh persistence, file download/upload flows, actual multiple-tab coordination, stale-tab blocking, missing-capability fallback, and continued operation after an already-loaded tab is disconnected.
- Check keyboard completion and backup flows, focus behavior, accessible names/progress/status messages, contrast, system themes, and responsive/touch layouts. Prefer behavioral assertions and direct inspection over broad brittle snapshots.
- Independently verify the production catalog against the official PDF. Structural validation tests alone cannot prove a transcribed title, page, ordering, or reward is correct.
- Keep automated tests free of live-network dependencies. Use small representative catalogs for behavior scenarios and validate the actual production catalog separately. No application tests are claimed to have run while the project contains design documents only.

## Out of Scope

- Other book editions or separately published supplements absent from the official fifth-edition tracker.
- Accounts, authentication, hosted profiles, backend APIs, databases, and automatic synchronization.
- Multiple reader profiles in one browser, mentor accounts, remote monitoring, and collaborative progress editing.
- Code editors, execution, grading, prerequisite enforcement, exercise instructions, substantial book excerpts, and solution code.
- Leaderboards, social features, streaks, multipliers, custom achievements, arbitrary levels, or custom XP beyond the one book-defined variable reward.
- Merging progress between devices, automatic backup transfer, and speculative catalog migrations before a second supported revision exists.
- Service workers, PWA installation, dependable offline reopening or refreshing, and installation flows.
- GitHub integration inside the application, admin dashboards, complex animation frameworks, and unneeded runtime/build dependencies.
- Silent recovery by dropping unknown progress, automatic catalog changes that alter results without review, or persistence guarantees when safe native coordination is unavailable.

## Further Notes

- This is a new application: the repository has design documents and no implementation, test suite, or initial commit yet. The spec synthesizes the original brief and the user's accepted interview decisions; it does not claim completed application work.
- The official fifth-edition tracker is the authoritative data source: [XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf). Supporting official resources include the [solutions index](https://csharpplayersguide.com/solutions/5th-edition/) and [book website](https://csharpplayersguide.com/).
- The author describes “Making It Your Own” as an open-ended modification Challenge in the [official solution](https://csharpplayersguide.com/solutions/5th-edition/final-battle-17-making-it-your-own). Its 50–400 XP range was supplied by the user from the book. Public primary sources checked did not independently establish its bounds or selection formula; the application's whole-number selection policy was explicitly accepted by the user.
- The [Web Storage standard](https://html.spec.whatwg.org/multipage/webstorage.html) supplies no cross-tab compare-and-set transaction. The [Web Locks standard](https://w3c.github.io/web-locks/) supports coordination among participating contexts; it does not prevent bypass writes. This is why the accepted design uses locks, stale-state checks, and a visible session-only fallback.
- Before public application release, verify the catalog against the PDF and document a basis for reusing book metadata. Research has not established an explicit metadata reuse license. This outstanding release evidence must not be represented as already resolved or as covered by MIT.
- The [MIT license](https://opensource.org/license/mit) applies to original application code. Maintain separate metadata attribution/permission documentation and an explicit unofficial-companion disclaimer.
- The finished public MVP must let a reader browse/search official entries, complete/uncomplete them, see correct XP and Character level, retain progress on normal refresh where safe persistence is available, export/import progress between devices, and use the app comfortably on mobile without registration. Public hosting and metadata-release evidence are part of completion.
- Publishing this specification to the issue tracker is authorized by the explicitly invoked to-spec skill. Contacting the author or deploying the application is a separate action and is not authorized by this issue-publication request.
