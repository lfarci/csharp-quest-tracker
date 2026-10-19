# C# Quest Tracker

An unofficial, browser-local companion for the fifth-edition XP tracker in [The C# Player's Guide](https://csharpplayersguide.com/). It tracks the book's 114 Challenges, derives XP and Character level, and supports manual CSV backup transfer. It does not require an account and never sends progress to a server.

## Use the tracker

Once GitHub Pages is manually deployed after release prerequisites are met, the project site will be <https://lfarci.github.io/csharp-quest-tracker/>. Until then, serve this folder locally:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Opening `index.html` directly as a `file:` URL does not work because the app loads its local catalog as an ES module.

Check a Challenge when you complete it. Challenges can be completed in any order. For “Expansion: Making it Yours,” choose any whole-number award from 50 through 400 XP. The Character level, XP, and completed count recalculate from the selected awards. Tracker completion counts every entry in the official tracker, including optional expansions and bonus checks.

Search and the All, Completed, and Remaining filters only change which rows are visible. They do not change the dashboard totals.

## Save and transfer progress

Where browser storage and cross-tab locks are available, each accepted change saves locally and returns after a normal refresh. If another tab saves first, the older tab is marked stale and its editing controls stop working. Reload it to continue from the latest saved progress.

The tracker explains when a browser cannot safely save. Your already-loaded tab remains usable; choose **Export this tab’s progress** in its warning to download the current session before leaving. Settings opens a separate session and cannot export another page’s unsaved changes. The browser is asked to warn before leaving a page with unsaved changes, but this warning is not guaranteed (especially on mobile). A confirmed import or recovery reset can also remain session-only after a write failure. Download a backup before clearing browser data; clearing site data can erase the saved tracker record.

To move progress between devices, export a CSV backup, transfer the file yourself, then select it with **Import progress backup**. Import shows the current and incoming completed counts, XP, and Character levels. Confirming replaces the current progress; it never merges records. Invalid or incompatible backups leave current progress unchanged.

If stored data cannot be read, the tracker labels statistics unavailable. It offers a separate download of the original recovery data, import of a compatible backup, or an explicitly confirmed fresh start. A recovery-data file is a copy of the original stored text, not a validated progress backup.

An already-loaded tab can keep tracking without an internet connection. Offline reopening and refreshing are not guaranteed. The app has no service worker or cloud synchronization.

## Project

This is a static HTML, CSS, and JavaScript application with a JSON catalog. It has no build step, backend, database, authentication, framework, or runtime dependency. Run the unit and static reference checks with Node.js:

```sh
npm test
```

Pull requests also run browser smoke checks in Chromium, Firefox and WebKit. Browser tooling is installed in CI only, not shipped to visitors.

The production catalog is checked against the [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf); see [catalog verification](docs/catalog-verification.md). For implementation details and decisions, see [the MVP specification](docs/mvp-issue-spec.md) and [the issue plan](docs/ticket-plan.md).

## Attribution and licensing

C# Quest Tracker is an unofficial companion to **The C# Player's Guide, Fifth Edition**, by **RB Whitaker**. It is not affiliated with or endorsed by RB Whitaker. Visit the [official book website](https://csharpplayersguide.com/) and [official fifth-edition XP tracker](https://csharpplayersguide.com/assets/content/downloadables/5th-edition/XPTracker.pdf).

Original application code is licensed under MIT; see [LICENSE](LICENSE). Book-derived tracking metadata has separate rights and provenance and is not relicensed by that file; see [Book metadata rights and attribution](docs/metadata-rights.md). Public release remains blocked until the reuse prerequisite in issue #9 is resolved.
