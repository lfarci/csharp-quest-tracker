# C# Quest Tracker

The language used to describe a reader's progress through The C# Player's Guide.

## Language

**Challenge**:
A trackable activity from the book, including regular Challenges, Knowledge Checks, and Boss Battles. Completion is self-reported, binary, and independent of other challenges.
_Avoid_: Quest except in the product name, exercise as a competing domain term

**Book level**:
A chapter label in a particular edition of the book, including numbered chapters and lettered bonus levels. It describes the book's organization, independently of the reader's character level.
_Avoid_: Level without qualification

**Book part**:
One of the five major sections used to group entries in the official fifth-edition PDF tracker.

**Character level**:
The reader's rank derived from accumulated XP using the book's leveling rules.
_Avoid_: Level without qualification, book level

**XP**:
Experience points awarded for completed challenges according to the selected book edition, including its permitted variable reward. Total XP is the sum of the rewards for distinct completed challenges.
_Avoid_: Score

**Variable XP reward**:
The 50–400 XP award specified in the fifth-edition book for “Expansion: Making it Yours,” shown as `?` in the official tracker. The reader selects a whole-number award within that range when completing the challenge.

**Tracker completion**:
The proportion of all official PDF tracker entries marked complete, including optional expansions and appendix checks. It measures completed tracker entries, independently of character level or the reader's chosen path through the book.
_Avoid_: Book mastery, required reading progress

**Catalog**:
The ordered collection of trackable challenges and their official metadata for a particular book edition.

**Catalog revision**:
A particular published version of the catalog for a book edition. Revisions distinguish corrections to rewards or entry membership within the same edition.

**Progress backup**:
A transferable record of completed challenge identifiers, their book edition and catalog revision, and any selected variable award. It represents progress at a point in time, rather than automatic synchronization between devices.
_Avoid_: Sync
