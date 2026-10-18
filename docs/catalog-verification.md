# Initial fifth-edition catalog verification

The catalog in `data/catalog.json` follows the [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf), retrieved on 2026-10-18. Its initial immutable revision is `5e-2026-10-18`; book edition and backup schema versions are separate fields.

The source PDF has two pages, 234,502 bytes, and SHA-256:

```text
a94a22cd026b269b2a725fa9137223139329b7995c12c3a2d8c5bbdfc4e1014e
```

Both pages were rendered and visually inspected. Text was extracted using Poppler `pdftotext -layout`; page 2 was read down the left column before continuing down the right column. Every entry was checked for membership, exact title, page, reward, Book part, and order. A separate integration agent independently compared all 114 catalog entries against those source columns and inspected both rendered pages, confirming the same results.

| Book part | Entries | Fixed XP |
| --- | ---: | ---: |
| 1: The Basics | 27 | 2,275 |
| 2: Object-Oriented Programming | 33 | 3,800 |
| 3: Advanced Features | 33 | 2,350 |
| 4: The Endgame | 18 | 3,200 |
| 5: Bonus Levels | 3 | 75 |
| Total | 114 | 11,700 |

Part totals above are verification aids, not extra XP awards. The fixed XP total excludes the variable-reward entry. All optional expansions, the Fountain of Objects additions, and the three bonus checks are included. The 114-entry denominator includes `making-it-yours` even before its completion flow is implemented.

The rendered ladder on PDF page 1 shows increments of 200, 400, 600, 800, 1,000, 1,200, 1,400, 1,600, and 1,800 XP. These produce the cumulative Character level thresholds 0, 200, 600, 1,200, 2,000, 3,000, 4,200, 5,600, 7,200, and 9,000 XP. The ladder is graphical and was not included in ordinary text extraction.

`Expansion: Making it Yours` retains the PDF's `?` notation. The 50–400 whole-number range comes from the user's book clarification recorded in ADR 0002, rather than from the PDF. `Exepti’s Game` and other PDF titles are retained exactly; the solutions index and errata do not override the tracker. No unverified Book level or Challenge-type labels have been added.

Identifiers are stable application identifiers, initially derived from the official titles; future display-title corrections must not regenerate them. `making-it-yours` is the reserved identifier from the specification. Catalog validation rejects duplicate IDs, invalid rewards, missing parts, and inconsistent ordering before progress is exposed. Behavioral tests supplement this source check; structural assertions alone do not establish transcription accuracy.

This verification establishes catalog fidelity. It does not establish permission to republish book metadata. Metadata reuse evidence remains a separate release prerequisite, and this catalog has not been pushed or deployed as part of issue #2.
