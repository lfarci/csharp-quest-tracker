# Use CSV for portable progress backups

Status: accepted

## Context

The tracker originally used JSON files for manual progress transfer. A CSV backup is easier to inspect and work with in spreadsheet software while keeping transfer local and reader-controlled.

## Decision

Export a UTF-8 CSV with one row for every catalog Challenge. Include the schema version, book edition, catalog revision, export timestamp, stable Challenge ID, title, completion state, and selected variable XP award. Repeat the backup metadata on each row so even an empty tracker has a complete, self-contained export format. Quote fields according to CSV rules.

Import validates the header, metadata, all expected Challenge rows, unique IDs, titles, completion values, and awards before previewing a replacement. Accept CSV backups only. Stored browser progress remains JSON and retains its current validation and coordination behavior.

## Consequences

The exported file is readable in spreadsheet software and can be inspected or edited. Import remains strict: incomplete, duplicated, unknown, or inconsistent Challenge rows are rejected without changing progress. CSV formatting and semantic validation stay behind the progress-session boundary.
