# Catalog data conventions

- `catalog.json` is source-verified fifth-edition tracking data. Never fabricate challenge names, order, pages, XP values, or thresholds.
- Keep challenge IDs stable and distinguish catalog revisions from the progress backup schema.
- Consult `docs/catalog-verification.md` before modifying metadata; run `npm test` after modifications.
- The original-code MIT license does not establish a reuse license for the book-derived catalog.
- Production catalog entries declare `type` as `challenge`, `boss-battle`, or `knowledge-check`; see `docs/catalog-verification.md` for the classification evidence. The field is presentational and must not change progress or backup behavior.
