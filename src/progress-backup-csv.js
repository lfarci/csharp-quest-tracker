/**
 * Portable CSV backup format. Keep the column order stable for exported
 * files and validate the entire input before applying any imported progress.
 */
const HEADERS = [
  'schemaVersion', 'bookEdition', 'catalogRevision', 'exportedAt',
  'challengeId', 'challengeTitle', 'completed', 'selectedXpAward',
];

function escapeField(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Parse quoted CSV fields without external dependencies.
function parseRows(contents) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;

  for (let index = 0; index < contents.length; index++) {
    const char = contents[index];
    if (quoted) {
      if (char === '"' && contents[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
        afterQuote = true;
      } else {
        field += char;
      }
    } else if (afterQuote) {
      if (char === ',') {
        row.push(field);
        field = '';
        afterQuote = false;
      } else if (char === '\n' || (char === '\r' && contents[index + 1] === '\n')) {
        if (char === '\r') index++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        afterQuote = false;
      } else {
        throw new Error('This CSV backup has invalid quoting. Your progress was not changed.');
      }
    } else if (char === '"') {
      if (field !== '') throw new Error('This CSV backup has invalid quoting. Your progress was not changed.');
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || (char === '\r' && contents[index + 1] === '\n')) {
      if (char === '\r') index++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('This CSV backup has an unterminated quoted field. Your progress was not changed.');
  if (row.length || field || afterQuote) {
    row.push(field);
    rows.push(row);
  }
  if (rows.at(-1)?.length === 1 && rows.at(-1)[0] === '') rows.pop();
  return rows;
}

/** Serialize progress as a portable, human-readable CSV with one row per Challenge. */
export function encodeProgressCsv({ catalog, progress, exportedAt }) {
  const metadata = [1, catalog.bookEdition, catalog.revision, exportedAt];
  const awards = progress.variableXpAwards ?? {};
  const rows = [HEADERS];
  for (const challenge of catalog.challenges) {
    rows.push([
      ...metadata,
      challenge.id,
      challenge.title,
      progress.completedChallengeIds.includes(challenge.id),
      awards[challenge.id] ?? '',
    ]);
  }
  return `${rows.map(row => row.map(escapeField).join(',')).join('\r\n')}\r\n`;
}

/** Parse and validate the CSV structure before domain validation checks awards and IDs. */
export function decodeProgressCsv(contents, catalog) {
  const rows = parseRows(contents.replace(/^\uFEFF/, ''));
  if (!rows.length || rows[0].length !== HEADERS.length || rows[0].some((header, index) => header !== HEADERS[index])) {
    throw new Error('This file is not a C# Quest Tracker CSV backup. Choose a supported progress backup.');
  }
  if (rows.length !== catalog.challenges.length + 1) {
    throw new Error('This CSV backup is incomplete or has extra Challenge rows. Your progress was not changed.');
  }

  const challengesById = new Map(catalog.challenges.map(challenge => [challenge.id, challenge]));
  const seen = new Set();
  let metadata;
  const completedChallengeIds = [];
  const variableXpAwards = {};

  for (const row of rows.slice(1)) {
    if (row.length !== HEADERS.length) throw new Error('This CSV backup has a row with the wrong number of columns. Your progress was not changed.');
    const [schemaVersion, bookEdition, catalogRevision, exportedAt, id, title, completed, selectedXpAward] = row;
    const rowMetadata = [schemaVersion, bookEdition, catalogRevision, exportedAt];
    if (!metadata) metadata = rowMetadata;
    else if (rowMetadata.some((value, index) => value !== metadata[index])) {
      throw new Error('This CSV backup has inconsistent edition or timestamp details. Your progress was not changed.');
    }
    const challenge = challengesById.get(id);
    if (!challenge || seen.has(id) || title !== challenge.title) {
      throw new Error('This CSV backup has an unknown, duplicate, or mismatched Challenge. Your progress was not changed.');
    }
    seen.add(id);
    if (completed !== 'true' && completed !== 'false') {
      throw new Error('This CSV backup has an invalid completion value. Use true or false. Your progress was not changed.');
    }
    if (completed === 'true') completedChallengeIds.push(id);
    if (selectedXpAward !== '') {
      if (!/^\d+$/.test(selectedXpAward)) throw new Error('This CSV backup has an invalid XP award. Your progress was not changed.');
      variableXpAwards[id] = Number(selectedXpAward);
    }
  }

  const [schemaVersion, bookEdition, catalogRevision, exportedAt] = metadata ?? [];
  const timestamp = Date.parse(exportedAt);
  if (schemaVersion !== '1' || bookEdition !== String(catalog.bookEdition) || catalogRevision !== catalog.revision ||
      !Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== exportedAt) {
    throw new Error('This backup is invalid or is for a different edition or catalog revision. Your progress was not changed.');
  }
  if (seen.size !== catalog.challenges.length) throw new Error('This CSV backup is missing Challenge rows. Your progress was not changed.');
  return { schemaVersion: 1, bookEdition: Number(bookEdition), catalogRevision, exportedAt, completedChallengeIds, variableXpAwards };
}
