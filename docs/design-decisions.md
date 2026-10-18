# Design interview

This document records accepted decisions and the design tree. [The consolidated MVP specification](mvp-spec.md) combines these decisions with the original project brief. The user subsequently requested synthesis and issue publication through the to-spec skill; the [published issue specification](mvp-issue-spec.md) is available as [GitHub issue #1](https://github.com/lfarci/csharp-quest-tracker/issues/1), labeled `ready-for-agent`.

## Accepted decisions

Round 1: the user accepted all six recommendations.

1. **Edition:** the MVP supports only the fifth edition; imports for other editions are rejected.
2. **Offline boundary:** an already-loaded tab remains usable without a connection. Offline reopening and refreshing are outside the MVP guarantee; service workers remain out of scope.
3. **Completion:** readers self-report completion using a binary checkbox. Each completed entry awards its full official XP, without prerequisites, grading, or partial credit. The subsequent clarification about the book's variable reward requires a separate award policy for that entry; it does not introduce partial completion.
4. **Invalid stored progress:** preserve the original data, explain the problem, and require an explicit recovery choice before overwriting it. Do not silently replace it with empty progress.
5. **Multiple tabs:** detect externally changed progress and require a stale tab to reload before making further edits. Silent overwrites of newer progress are unacceptable. The accepted coordination and fallback policy is recorded below.
6. **Language:** Challenge is the umbrella term; Quest is branding. Use Book level and Character level explicitly, and `completedChallengeIds` in stored progress and backups.

Round 2: the user directed us to follow the official PDF tracker. This settles the source of truth; it does not accept the other recommendations from that round.

7. **Catalog authority:** mirror the official fifth-edition PDF tracker for challenge membership, titles, order, XP rewards, and character-level thresholds. Other sources may provide missing placement metadata, but must not silently override the PDF. Separately published supplements do not expand the MVP catalog unless present in this tracker.
8. **Variable reward:** preserve the fact that the tracker gives “Expansion: Making it Yours” a `?` reward. The user clarified that the book specifies **50–400 XP**. These bounds are user-supplied book evidence; the public sources checked did not supply the range. The earlier proposal to omit its numeric XP was not accepted and must not be treated as an official rule.

Round 3: the user accepted Q15's recommendation.

9. **Variable award selection:** completing “Expansion: Making it Yours” prompts the reader to choose a whole-number award from 50 through 400 XP, inclusive. Persist this individual award with progress and include it in exported backups. Total XP remains derived from distinct completed challenges and their applicable rewards. Canceling award selection must not complete the challenge. Imports and stored progress must validate the award along with the completion state, consistently with the brief's requirement to reject invalid progress.

Round 4: the user accepted all seven outstanding recommendations (Q16, Q17, Q9, Q11, Q12, Q13, and Q10).

10. **Unchecking the variable reward:** remove its selected award together with completion. Completing it again prompts for a new award.
11. **Tracker completion:** calculate the completed-entry count divided by all official PDF tracker entries, including optional expansions and appendix checks. Label the percentage “Tracker completion”; it does not describe mastery or a required reading path.
12. **Maximum character level:** level 10 is the maximum, beginning at 9,000 XP. Continue accumulating total XP and display “Maximum level” without inventing a next-level threshold.
13. **Catalog revisions:** include a catalog revision in saved progress and exported backups, independently of the backup schema version. Preserve completed identifiers and require explicit review before adopting revisions that change XP or completion totals.
14. **Failed saves:** allow tracking for the current session if storage is unavailable or a save fails. Display a persistent “Progress isn't saved” message and keep export usable.
15. **Corruption recovery:** offer downloading the original data, importing a valid backup, or an explicitly confirmed fresh start. Preserve the original until its replacement is chosen.
16. **Metadata reuse:** document the basis for reusing the book's metadata before public release. Research has not yet established this basis; no author contact is authorized by this interview.

Round 5: the user accepted Q18 through Q23.

17. **Checklist organization:** mirror the PDF's five Parts and page numbers. This supersedes the brief's primary grouping by book chapter. Add chapter and challenge-type labels only when verified; missing supplemental metadata must not prevent tracking a PDF entry.
18. **Unknown catalog revisions:** reject imports from an unrecognized catalog revision without changing existing progress. Recognized older revisions require a supported interpretation or migration.
19. **Safe browser coordination:** use native coordination between participating tabs to prevent simultaneous overwrites. If the browser cannot coordinate safe saves, use session-only progress with a visible warning and export, matching the unavailable-storage policy.
20. **Import review:** show current and incoming completed counts, XP, character level, and any migration effects before confirming replacement.
21. **Title search:** include title search alongside All, Completed, and Remaining filters.
22. **License:** use MIT for the application's original code and document book-metadata permissions separately. This does not establish rights to reuse the metadata.

## Design tree

- Fifth edition only — accepted.
  - Official catalog membership — mirror the PDF tracker, accepted.
    - Variable-XP entry — 50–400 XP range established from the user's book; whole-number selection, persistence, and export accepted.
      - Unchecking removes the award and rechecking prompts again — accepted.
      - Apply strict award validation under the brief's existing invalid-progress rules.
    - Challenge types and book levels — supplemental labels only when verified, accepted.
    - Completion denominator and meaning — all PDF entries, labeled Tracker completion, accepted.
  - Source precedence — PDF tracker is authoritative, accepted.
  - Final character-level presentation — maximum level 10 with continued XP accumulation, accepted.
  - Metadata reuse basis before publication — release prerequisite accepted; evidence remains outstanding.
  - Catalog revisions and existing progress — revision stamp and explicit review accepted.
    - Unknown revisions rejected; supported migrations require explicit comparison and confirmation — accepted.
- Local progress and manual transfer — required by the brief.
  - Loaded-session offline scope — accepted.
  - Invalid stored progress preservation — accepted.
    - Recovery choices — original-data download, valid backup import, or confirmed fresh start, accepted.
  - Stale-tab editing blocked — accepted.
    - Native coordinated saves with stale-state checking; session-only fallback when safe coordination is unavailable — accepted.
  - Unavailable storage and failed writes — session tracking, persistent warning, and export, accepted.
  - Backup validation and replacement confirmation — strict validation plus before/after statistics and migration review, accepted.
- Terminology and completion model — accepted.
- Interface — five-Part grouping, page numbers, title search, filters, system theme, responsive and accessible controls, accepted.
- Delivery — static GitHub Pages site, original code under MIT, baseline tests and documentation from the brief, accepted.
- No design questions remain on the current frontier. Metadata reuse evidence and catalog verification remain implementation/release work, not settled factual claims.
- The user moved from the interview to spec synthesis through the explicit to-spec request. No further design interview was conducted.

## Published specification

The to-spec workflow produced a standalone specification with the seven requested sections and 60 user stories. It retains the accepted glossary and ADR decisions and proposes one public progress-session interface as the primary behavioral testing boundary, supplemented by focused checks of actual browser behavior. The focused testing-expectation check was presented to the user; no explicit response was received before publication, so the boundary remains an implementation proposal rather than a separately confirmed user preference.

Published [GitHub issue #1](https://github.com/lfarci/csharp-quest-tracker/issues/1) with `ready-for-agent`. The published body was read back and verified against the local issue specification, and the label was verified. The repository had no existing issues; the required label was created as part of publication. Application implementation and public website deployment have not started.

## Verified sources

- [Official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf): XP rewards and character-level progression. Character levels 1–10 begin at 0, 200, 600, 1,200, 2,000, 3,000, 4,200, 5,600, 7,200, and 9,000 XP. Includes optional expansions, appendix checks, and “Expansion: Making it Yours” with an unspecified `?` XP reward.
- [Official fifth-edition solutions index](https://csharpplayersguide.com/solutions/5th-edition/): chapter placement, including appendices A, B, and C. Solution pages do not necessarily correspond one-to-one with XP awards.
- [Official fifth-edition errata](https://csharpplayersguide.com/errata/5th-edition): title corrections, including Excepti’s Game.
- [Official expansions page](https://csharpplayersguide.com/expansions/): separately published C# version supplements, distinct from expansion challenges inside the book.
- [Official fifth-edition sample](https://csharpplayersguide.com/TheCSharpPlayersGuide-5thEdition-Sample.pdf): copyright notice; research has not established an explicit metadata reuse license. No legal conclusion has been made.
- [Official Making It Your Own solution](https://csharpplayersguide.com/solutions/5th-edition/final-battle-17-making-it-your-own): confirms that readers choose their own game modifications. It does not specify an XP range or award procedure. The user supplied the book's 50–400 XP range; it has not been independently verified from a public primary source.
- [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html): authors must assume no locking across agent clusters. A localStorage revision check followed by a write cannot by itself guarantee prevention of simultaneous lost updates; this is an inference from the specified concurrency behavior.
- [Web Locks specification](https://w3c.github.io/web-locks/): exclusive locks coordinate participating tabs sharing a storage bucket. Locks do not prevent writes by code that does not participate in the protocol.
- [MIT license](https://opensource.org/license/mit): selected license text for original application code.
