# Book catalog rights, provenance, and attribution

Reviewed: **19 October 2026**. Scope: the fifth-edition catalog shipped in `data/catalog.json` (revision `5e-2026-10-18`) and publicly accessible through this repository and its GitHub Pages site.

**Assessment, not a rights-holder license or legal opinion.** The maintainer's approach is to document and manage the limited intellectual-property risk of a functional, unofficial companion, rather than treating the absence of an express permission as proof of infringement. This does **not** establish that every catalog title or the complete collection is unprotected. Anyone needing legal certainty should seek advice or permission.

Related records: [issue #9](https://github.com/lfarci/csharp-quest-tracker/issues/9), [official tracker catalog verification](catalog-verification.md), and [catalog authority decision](adr/0002-official-pdf-tracker-is-authoritative.md).

## Exactly what the project uses

- The **114 short Challenge titles** and their **five Book parts**, in the official tracker's order.
- Factual **page references**, **XP rewards**, the `?` variable-reward notation, and **Character-level thresholds**.
- Stable identifiers invented for the app, used to restore progress correctly.
- The 50–400 XP bounds for “Expansion: Making it Yours,” verified against the book by the project owner; the separate PDF uses `?`.

The app **does not reproduce** the exercise prompts, substantial instructional passages, solutions, book PDF, tracker PDF, cover illustrations, maps, or the source PDF's visual layout. It cannot replace the book as a programming course: the reader must use the book to perform each Challenge. It does not grade or reveal solutions. The app is independent, free, and not endorsed by the author.

## Sources and legal framework

| Primary source | Relevant principle and limit |
| --- | --- |
| [Belgian FPS Economy: What is protected by copyright?](https://economie.fgov.be/en/themes/intellectual-property/intellectual-property-rights/copyright-and-related-rights/copyright/copyright-protection-works/what-copyright-protection/what-protected-copyright) | Copyright protects original expression, not ideas or methods; creative choices can matter even in short or functional works. |
| [Belgian FPS Economy: Database copyright](https://economie.fgov.be/en/themes/intellectual-property/intellectual-property-rights/copyright-and-related-rights/legal-protection-databases/protection-databases/database-copyright-protection) | Copyright in a database depends on originality in the selection or arrangement. Completeness or labour alone is insufficient. |
| [Belgian FPS Economy: Sui generis database right](https://economie.fgov.be/en/themes/intellectual-property/intellectual-property-rights/copyright-and-related-rights/legal-protection-databases/protection-databases/protection-sui-generis-right/object-and-conditions) | Separate protection is conditional on substantial qualifying investment; it is not automatic for every list. |
| [CJEU, Football Dataco, C-604/10](https://eur-lex.europa.eu/legal-content/en/SUM/?uri=CELEX%3A62010CJ0604) | Database copyright requires original, freely chosen selection or arrangement; this is distinct from the investment-based right. |
| [CJEU, British Horseracing Board, C-203/02](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A62002CJ0203) | Investment in **creating** underlying data does not count as investment in **obtaining** pre-existing materials for the database right. Qualifying verification/presentation investment may still matter. |
| [Official fifth-edition downloads](https://csharpplayersguide.com/downloadables/5th-edition/) | The author freely publishes an XP Tracker for readers; this availability is not itself a redistribution license. |
| [Official fifth-edition XP Tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf) | Source for the fields reproduced in the app. Its contents and ordering should be reviewed as a whole, not only field by field. |
| [Official FAQ](https://csharpplayersguide.com/faq.html) | The author encourages learners to share their **own solutions**, including through GitHub. This is relevant community context, **not** an express license for the separately distributed tracker catalog. |

Earlier review also examined the [fifth-edition book sample](https://csharpplayersguide.com/TheCSharpPlayersGuide-5thEdition-Sample.pdf), [solutions index](https://csharpplayersguide.com/solutions/5th-edition/), and [author's solutions repository](https://github.com/rbwhitaker/CSharpPlayersGuideSolutions). The book's rights notice and any MIT license applicable to solution **code** do not license all book content or this catalog. No specific public grant for the catalog has been identified, and no author contact has been made.

## Application to C# Quest Tracker

**Lower-risk elements:** numerical XP values and level thresholds, page numbers, identifiers created by this project, and the general idea of tracking a reader's completion. They are functional facts or ideas rather than reproductions of exercise instructions.

**Residual uncertainty:** individual creative Challenge titles may contain original expression. More importantly, reproducing **all 114 titles in the author's order and grouping** may raise a claim based on an original selection/arrangement or, if qualifying investment is established, a database right. Because the project mirrors the *complete* tracker, it cannot assume the use is insubstantial if such a right applies.

The author encouraging public solutions, the project's educational/noncommercial character, clear attribution, and its need for a purchased book are helpful factual context. **None is an automatic copyright exception or permission.** Conversely, the lack of written permission alone does not prove the use infringes a right. Determining the actual scope of protected material and whether a right is engaged is fact-dependent.

**Maintainer policy:** treat this as an independently built **companion/reference tool with documented residual risk**, not as an unauthorized copy of the textbook and not as definitively cleared by the rights holder. Keep the dataset limited to the reference fields required for tracking. Reassess before adding exercise instructions, graphics, excerpts, commercial monetization, new editions, or substantial additional book metadata. If the author identifies a rights concern, review it promptly and consider changing, removing, or licensing the relevant data.

## Attribution

Use the following wording in the site and README:

> C# Quest Tracker is an unofficial companion to **The C# Player's Guide, Fifth Edition**, by **RB Whitaker**. It is not affiliated with or endorsed by RB Whitaker. See the [official book website](https://csharpplayersguide.com/) and [official fifth-edition XP Tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf).

The existing About page also links to purchase options. Trademark and book-title references identify the resource the app accompanies; they do not claim sponsorship.

## Licensing boundaries

- [`LICENSE`](../LICENSE) contains the standard **MIT License** for the project's **original application code** and other original material that its copyright holders may license.
- The project **does not claim copyright in facts** such as numerical XP values, nor claim ownership of the book's original material.
- The MIT notice is **not a sublicense or grant of third-party rights** in book-derived names, creative expressions, or any protectable selection/arrangement in `data/catalog.json`. To the extent such rights exist, they remain with their respective holders.
- Users and downstream projects must separately assess whether their use of third-party content requires permission. **Attribution and an MIT license do not cure infringement.**
- Progress CSV exports reflect a reader's tracking data and include title reference fields; they are not licenses for independently distributing book content.

## Review outcome and limits

This document replaces an earlier **project-level blanket release hold** with an explicit and reviewable risk assessment. It does **not** conclude that a permission grant exists, that database protection is inapplicable, or that every possible use of the entire collection is lawful. The repository is public and Pages can deploy from `main`; the technical release workflow has no legal-clearance check.

The maintainer may treat completion of this documented assessment and correct code/data licensing boundary as the scope of [issue #9](https://github.com/lfarci/csharp-quest-tracker/issues/9), acknowledging the residual risks above. Seek a qualified Belgian/EU IP opinion or author permission if a definitive clearance is required.
