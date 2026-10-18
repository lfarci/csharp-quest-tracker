import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserProgressSession, PROGRESS_STORAGE_KEY } from '../src/browser-progress.js';
import { decodeProgressCsv, encodeProgressCsv } from '../src/progress-backup-csv.js';

const catalog = {
  bookEdition: 5, revision: 'test-revision',
  parts: [1, 2, 3, 4, 5].map(id => ({ id, title: `Part ${id}` })),
  levelThresholds: [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000],
  challenges: [
    { id: 'fixed', title: 'Fixed', bookPart: 1, page: 1, order: 1, reward: { kind: 'fixed', xp: 150 } },
    { id: 'making-it-yours', title: 'Expansion: Making it Yours', bookPart: 4, page: 2, order: 2,
      reward: { kind: 'variable', notation: '?', minimum: 50, maximum: 400 } },
  ],
};
const backup = (overrides = {}) => {
  const { schemaVersion = 1, bookEdition = 5, catalogRevision = 'test-revision', exportedAt = '2026-10-18T12:00:00.000Z',
    completedChallengeIds = ['fixed'], variableXpAwards = {}, totalXp } = overrides;
  let contents = encodeProgressCsv({ catalog, progress: { completedChallengeIds, variableXpAwards }, exportedAt: '2026-10-18T12:00:00.000Z' });
  contents = contents.replaceAll('1,5,test-revision,2026-10-18T12:00:00.000Z,',
    `${schemaVersion},${bookEdition},${catalogRevision},${exportedAt},`);
  if (totalXp !== undefined) contents = contents.replace('exportedAt,challengeId,challengeTitle,completed,selectedXpAward',
    'exportedAt,challengeId,challengeTitle,totalXp,completed,selectedXpAward');
  return contents;
};

function harness(raw = null, options = {}) {
  let value = raw;
  let notify;
  const storage = {
    getItem(key) { assert.equal(key, PROGRESS_STORAGE_KEY); if (options.readError) throw options.readError; return value; },
    setItem(key, next) { assert.equal(key, PROGRESS_STORAGE_KEY); if (options.writeError) throw options.writeError; value = next; },
  };
  const adapters = {
    storage,
    lockManager: options.noLocks ? undefined : { request(_name, callback) { return Promise.resolve().then(() => callback({})); } },
    onStorageChange(listener) { notify = listener; },
    createIdentity: (() => { let count = 0; return () => `write-${++count}`; })(),
  };
  return { adapters, get raw() { return value; }, notify: next => notify({ key: PROGRESS_STORAGE_KEY, newValue: next }) };
}

test('valid backup preview compares current and incoming summaries without changing progress', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('making-it-yours', true);
  await session.submitVariableAward('making-it-yours', 237);
  const before = session.getProgress();
  const preview = session.previewImport(backup({ completedChallengeIds: ['fixed', 'making-it-yours'], variableXpAwards: { 'making-it-yours': 300 } }));
  assert.deepEqual(preview.current, { completedCount: 1, totalXp: 237, characterLevel: 2 });
  assert.deepEqual(preview.incoming, { completedCount: 2, totalXp: 450, characterLevel: 2 });
  assert.equal(preview.replaces, true);
  assert.deepEqual(session.getProgress(), before);
  assert.equal(h.raw, JSON.stringify({ ...before, internalWriteId: 'write-2' }));
});

test('CSV preview and confirmation replace progress and preserve the selected variable award', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('fixed', true);
  const contents = encodeProgressCsv({ catalog, progress: {
    completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': 237 },
  }, exportedAt: '2026-10-18T12:00:00.000Z' });
  const preview = session.previewImport(contents);
  assert.equal(preview.incoming.completedCount, 1);
  assert.equal(preview.incoming.totalXp, 237);
  await session.confirmImport(preview);
  assert.deepEqual(session.getProgress().completedChallengeIds, ['making-it-yours']);
  assert.deepEqual(session.getProgress().variableXpAwards, { 'making-it-yours': 237 });
});

test('invalid CSV imports leave the current progress and stored data unchanged', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('fixed', true);
  const before = session.getProgress();
  const rawBefore = h.raw;
  const valid = encodeProgressCsv({ catalog, progress: { completedChallengeIds: [], variableXpAwards: {} },
    exportedAt: '2026-10-18T12:00:00.000Z' });
  const invalid = valid.replace('fixed,Fixed,false,', 'fixed,Fixed,maybe,');
  assert.throws(() => session.previewImport(invalid), /completion value/i);
  assert.deepEqual(session.getProgress(), before);
  assert.equal(h.raw, rawBefore);
});

test('the CSV-only importer rejects older JSON backup files clearly', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const legacyBackup = JSON.stringify({ schemaVersion: 1, bookEdition: 5, catalogRevision: 'test-revision',
    completedChallengeIds: ['fixed'], variableXpAwards: {}, exportedAt: '2026-10-18T12:00:00.000Z' });
  assert.throws(() => session.previewImport(legacyBackup), /CSV backups only/i);
  assert.deepEqual(session.getProgress().completedChallengeIds, []);
  assert.equal(h.raw, null);
});

test('canceling a preview and rejecting a stale same-tab preview preserve current progress', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const canceled = session.previewImport(backup());
  session.cancelImport(canceled);
  await assert.rejects(session.confirmImport(canceled), /cancel|review/i);
  const preview = session.previewImport(backup());
  await session.setCompletion('fixed', true);
  const saved = h.raw;
  await assert.rejects(session.confirmImport(preview), /changed|fresh review|review again/i);
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, ['fixed']);
  assert.equal(h.raw, saved);
});

test('confirmation replaces rather than merges, then exports only validated progress', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('fixed', true);
  const preview = session.previewImport(backup({ completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': 237 } }));
  await session.confirmImport(preview);
  assert.deepEqual(session.getProgress().completedChallengeIds, ['making-it-yours']);
  assert.equal(session.getView().dashboard.totalXp, 237);
  assert.equal(JSON.parse(h.raw).internalWriteId, 'write-2');
  assert.equal('internalWriteId' in decodeProgressCsv(session.exportBackup().contents, catalog), false);
});

test('CSV rejects duplicate rows and invalid data without mutating session or storage', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('fixed', true);
  const before = session.getProgress();
  const rawBefore = h.raw;
  const invalid = [
    '{"schemaVersion":1}', backup({ schemaVersion: 2 }), backup({ bookEdition: 4 }), backup({ catalogRevision: 'unknown' }),
    backup().replace('fixed,Fixed,', 'unknown,Unknown,'), backup({ completedChallengeIds: ['making-it-yours'] }),
    backup({ completedChallengeIds: ['fixed'], variableXpAwards: { fixed: 50 } }),
    backup({ completedChallengeIds: ['fixed'], variableXpAwards: { 'making-it-yours': 237 } }),
    backup({ completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': 49 } }),
    backup({ completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': 401 } }),
    backup({ completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': 237.5 } }),
    backup({ exportedAt: 'not a timestamp' }), backup({ totalXp: 150 }),
  ];
  for (const contents of invalid) assert.throws(() => session.previewImport(contents));
  const duplicateRows = backup().trimEnd().split('\r\n');
  duplicateRows[2] = duplicateRows[1];
  assert.throws(() => session.previewImport(duplicateRows.join('\r\n')), /duplicate/i);
  assert.deepEqual(session.getProgress(), before);
  assert.equal(h.raw, rawBefore);
});

test('another tab changing storage after preview prevents import replacement even without a delivered event', async () => {
  const h = harness();
  const first = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const second = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const preview = second.previewImport(backup());
  await first.setCompletion('fixed', true);
  await assert.rejects(second.confirmImport(preview), /changed|reload/i);
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, ['fixed']);
});

test('confirmed imports remain usable but unsaved when locks or writes fail', async () => {
  for (const options of [{ noLocks: true }, { writeError: new Error('quota') }]) {
    const h = harness(null, options);
    const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
    const preview = session.previewImport(backup({ completedChallengeIds: ['fixed'] }));
    await session.confirmImport(preview);
    assert.equal(session.getView().dashboard.totalXp, 150);
    assert.equal(session.getStatus().saved, false);
    assert.equal(session.exportBackup().contents.includes('fixed'), true);
    if (options.writeError) assert.equal(h.raw, null);
  }
});

test('valid confirmation can replace malformed saved data while preserving it if the repair write fails', async () => {
  const h = harness('{broken', { writeError: new Error('quota') });
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  assert.equal(session.previewImport(backup()).current, null);
  const preview = session.previewImport(backup());
  await session.confirmImport(preview);
  assert.equal(session.getStatus().recoveryNeeded, false);
  assert.equal(session.getStatus().saved, false);
  assert.equal(h.raw, '{broken');
  assert.equal(session.getView().dashboard.totalXp, 150);
});

test('import preview labels inaccessible current progress unavailable and a confirmed replacement becomes reliable session progress', async () => {
  const h = harness(null, { readError: new Error('denied') });
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const preview = session.previewImport(backup({ completedChallengeIds: ['fixed'] }));
  assert.equal(preview.current, null);
  await session.confirmImport(preview);
  assert.equal(session.getView().dashboard.totalXp, 150);
  assert.equal(session.getStatus().saved, false);
});
