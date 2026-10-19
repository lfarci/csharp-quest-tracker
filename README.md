# C# Quest Tracker

An unofficial, browser-local companion for the fifth-edition XP tracker in [The C# Player's Guide](https://csharpplayersguide.com/). It tracks the book's 114 Challenges, derives XP and Character level, and supports manual CSV backup transfer. It does not require an account and never sends progress to a server.

## Use the tracker

The GitHub Pages project site is <https://lfarci.github.io/csharp-quest-tracker/>. You can also serve the project locally:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Opening `index.html` directly as a `file:` URL does not work because the app loads its local catalog as an ES module.

Check a Challenge when you complete it. Challenges can be completed in any order. For “Expansion: Making it Yours,” choose any whole-number award from 50 through 400 XP. The Character level, XP, and completed count recalculate from the selected awards. Tracker completion counts every entry in the official tracker, including optional expansions and bonus checks.

Search and the All, Completed, and Remaining filters only change which rows are visible. They do not change the dashboard totals.

## Save and transfer progress

Progress saves in your browser when safe storage is available. If another tab updates it, reload the stale tab. Clearing browser data can erase saved progress.

Use **Settings** to export a CSV backup and import it on another device. Import previews the changes and **replaces**, rather than merges, current progress. Invalid backups are rejected.

If saving fails, use **Export this tab’s progress** in the warning before leaving. Settings cannot export another tab’s unsaved changes. Damaged saved data can be downloaded, restored from a valid backup, or reset with confirmation.

An already-loaded tab works offline, but reopening or refreshing offline is not guaranteed. There is no cloud sync.

## Project

This is a static HTML, CSS, and JavaScript application with a JSON catalog. It has no build step, backend, database, authentication, framework, or runtime dependency. Run the unit and static reference checks with Node.js:

```sh
npm test
```

Pull requests also run browser smoke checks in Chromium, Firefox and WebKit. Browser tooling is installed in CI only, not shipped to visitors.

The production catalog is checked against the [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf); see [catalog verification](docs/catalog-verification.md). For implementation details and decisions, see [the MVP specification](docs/mvp-issue-spec.md) and [the issue plan](docs/ticket-plan.md).

## Attribution and licensing

C# Quest Tracker is an unofficial companion to **The C# Player's Guide, Fifth Edition**, by **RB Whitaker**. It is not affiliated with or endorsed by RB Whitaker. Visit the [official book website](https://csharpplayersguide.com/) and [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf).

**Original application code** is provided under the [MIT License](LICENSE). The app's fifth-edition [Challenge catalog](data/catalog.json) is a functional reference dataset based on the book's publicly available XP Tracker. Its titles, grouping and ordering may involve third-party rights; **MIT does not sublicense that book-derived content**. Facts such as XP values and page references are not claimed as original work owned by this project.

See [Catalog rights, provenance and assessment](docs/metadata-rights.md) for the sourced Belgian/EU copyright and database-right analysis, the scope of the reproduced metadata, and residual uncertainty. The project does not reproduce exercises or solutions, and it makes no claim of permission or endorsement from RB Whitaker.

GitHub Pages deployment is automatic on merges to `main`, with an optional manual workflow. Review rights implications before adding new book-derived content.
