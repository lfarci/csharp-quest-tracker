# Book metadata rights and attribution

Evidence reviewed: **18 October 2026**. Related work: [metadata-reuse prerequisite, issue #9](https://github.com/lfarci/csharp-quest-tracker/issues/9), [ticket requirements](tickets/08-establish-metadata-reuse-basis.md), and [catalog authority ADR](adr/0002-official-pdf-tracker-is-authoritative.md).

## Release status

**Public release remains blocked. Issue #9 is incomplete.** The sources below establish where the tracking metadata comes from, but do not establish a supported reuse basis sufficient for this project's agreed public-release prerequisite. No permission evidence was supplied by the user in the specification or this implementation task. Local implementation and verification may continue under the specification; this document does not authorize publication of the application or catalog.

This is an evidence record and release decision, not a conclusion about whether a particular copyright exception applies. Attribution, public download availability, and an MIT license on the application's original code do not establish permission to republish the book's complete tracker catalog.

## Material covered by this review

The proposed catalog reproduces fifth-edition Challenge titles, ordered membership, Book parts, page references, fixed XP rewards and the variable reward notation, plus Character-level thresholds. Supplementary verified Book level and Challenge-type labels also need coverage if included. Review must address the catalog as a collection as well as individual fields.

The scope excludes exercise instructions, substantial passages, solution code, cover art, maps, and the original tracker PDF's visual design. Keep these outside the application and its published assets. Link to official resources instead of bundling them.

## Primary-source evidence

| Source | What was established | Limit of the evidence |
| --- | --- | --- |
| [Official fifth-edition downloads](https://csharpplayersguide.com/downloadables/5th-edition/) | The author provides an XP Tracker download. The page carries an RB Whitaker copyright footer. | No explicit license for republication of the tracker metadata was found on this page. |
| [Official standalone XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf) | The two-page tracker supplies catalog membership, ordering, titles, five Book parts, page references and XP. It displays `?` for the variable reward. | No explicit reuse grant was found in the examined PDF. Availability and catalog accuracy are separate from permission evidence. |
| [Fifth-edition book sample](https://csharpplayersguide.com/TheCSharpPlayersGuide-5thEdition-Sample.pdf), PDF page 3 | The copyright page identifies RB Whitaker, copyright 2012–2022. Its notice reserves rights and describes written permission for reproduction/transmission, with a brief-review-quotation exception. | This notice does not provide a grant covering public republication of the catalog in this application. Do not represent it as permission. |
| Same [book sample](https://csharpplayersguide.com/TheCSharpPlayersGuide-5thEdition-Sample.pdf), PDF page 25, “Experience Points and Levels” | The author explains how readers check off activities, earn XP and obtain extra tracker copies online. | Reader use of extra tracker copies does not establish the required grant for a separately hosted machine-readable catalog. |
| [Official fifth-edition solutions index](https://csharpplayersguide.com/solutions/5th-edition/) | Supplies supplementary Book level/title information, explains its educational purpose, and links the author's solution downloads. | No explicit metadata republication grant was found on the index. These titles do not override the standalone tracker under the ADR. |
| [Author's solutions repository](https://github.com/rbwhitaker/CSharpPlayersGuideSolutions) | The repository identifies itself as the author's solutions for several editions and is marked MIT by GitHub. | A license for that software does not establish that the separately hosted tracker PDF and full catalog are covered. The license file could not be retrieved in this review; no unexamined license text is relied on. Solution code is outside this application's scope. |
| [Official FAQ](https://csharpplayersguide.com/faq.html) | Encourages readers to share their own solutions, including on GitHub. | Sharing one's own solutions does not establish permission to republish the book's complete metadata collection. |

The [official contact page](https://csharpplayersguide.com/contact.html) links the author's [book issue repository](https://github.com/rbwhitaker/CSharpPlayersGuideEarlyAccess). That repository describes issue tracking for book patches and future editions; no catalog reuse grant was found there. No author contact or outgoing message was made during this review.

The sample's embedded tracker has different page references from the standalone tracker. Use the sample for the rights notice and supporting discussion, and the standalone PDF for catalog verification. The variable reward's 50–400 XP bounds were supplied by the user from the book, as recorded in the [specification](mvp-issue-spec.md); that clarification is not a metadata reuse grant.

## What must resolve the release blocker

Before closing #9 or publishing the application or catalog, retain independently reviewable evidence for either an applicable rights-holder grant/license or another supported reuse basis explicitly reviewed for this use. Record all of the following here:

- The evidence itself or a durable source reference, its date, and who supplied or issued it.
- Coverage of the fifth-edition titles, placement/pages, ordered catalog membership, XP rewards/thresholds and any supplementary fields actually shipped.
- Coverage of public distribution of the catalog in the source repository and static website, including the proposed hosting and any material restrictions.
- Exact required attribution, notices, modification conditions, distribution conditions and any limits; apply them in release artifacts.
- The maintainer's review outcome and the artifact/revision it covers.

An evidence-missing note does not complete #9. If a future grant covers less than the proposed catalog, reconcile the application and specification before treating release as cleared. Contacting the author requires separate authorization; this ticket does not authorize it.

## Attribution prepared for the site and release documentation

Use this text with working links in the website footer/about area and release documentation. Add any further conditions once a reuse basis is established; this draft itself grants no rights.

> C# Quest Tracker is an unofficial companion to **The C# Player's Guide, Fifth Edition**, by **RB Whitaker**. It is not affiliated with or endorsed by RB Whitaker. Visit the [official book website](https://csharpplayersguide.com/) and [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf).

## Original code and third-party metadata

The project's MIT license applies to original application code. Book-derived titles, placement, XP and catalog content are documented separately in this file and are **not relicensed under the application's MIT license**. Do not describe the complete repository or catalog as MIT-licensed without this boundary.

Prepared licensing notice for the README and release documentation:

> Original application code is licensed under MIT. Book-derived tracking metadata has separate rights and provenance; see [Book metadata rights and attribution](docs/metadata-rights.md). The application's MIT license does not grant rights in that metadata. Public release is pending the documented metadata-reuse prerequisite.

When the release prerequisite is resolved, update the final sentence to describe the supported basis and its conditions accurately. Keep the code/metadata distinction and unofficial status visible.
