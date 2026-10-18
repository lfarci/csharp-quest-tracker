# Keep progress in the browser with manual transfer

The MVP owns a single reader's progress within the browser and transfers it between devices through explicit backup export and replacement import. The original JSON format was later replaced by CSV; see [ADR 0005](0005-csv-progress-backups.md). This avoids accounts and hosted storage, accepting that backups and device transfer are the reader's responsibility; offline use is guaranteed only within an already-loaded tab, not across offline reopening or refreshing.
