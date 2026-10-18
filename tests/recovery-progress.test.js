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

function harness(raw, options = {}) {
  let value = raw;
  let notify;
  const storage = {
    getItem(key) { assert.equal(key, PROGRESS_STORAGE_KEY); return value; },
    setItem(key, next) { assert.equal(key, PROGRESS_STORAGE_KEY); if (options.writeError) throw options.writeError; value = next; },
  };
  return {
    adapters: {
      storage, lockManager: options.noLocks ? undefined : { request(_name, callback) { return Promise.resolve().then(() => callback({})); } },
      onStorageChange(listener) { notify = listener; }, createIdentity: () => 'fresh-write',
    },
    get raw() { return value; },
    replace(next) { value = next; },
    notify(next) { notify({ key: PROGRESS_STORAGE_KEY, newValue: next }); },
  };
}

test('raw recovery export preserves damaged source text exactly and does not mutate storage', async () => {
  const original = '  { "schemaVersion": 99, "future": [1,2] }\n';
  const h = harness(original);
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const recovery = session.exportRecoveryData();
  assert.match(recovery.filename, /recovery-data.*\.txt$/);
  assert.equal(recovery.contents, original);
  assert.equal(session.exportBackup(), null);
  assert.equal(h.raw, original);
  assert.equal(session.getStatus().recoveryDataAvailable, true);
});

test('canceling a fresh start leaves damaged bytes and unavailable statistics unchanged', async () => {
  const original = '{broken';
  const h = harness(original);
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const review = session.previewFreshStart();
  session.cancelFreshStart(review);
  await assert.rejects(session.confirmFreshStart(review), /canceled|review/i);
  assert.equal(h.raw, original);
  assert.equal(session.getView(), null);
  assert.equal(session.getStatus().recoveryDataAvailable, true);
});

test('confirmed fresh start saves empty validated progress and recalculates level one', async () => {
  const h = harness('{broken');
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const review = session.previewFreshStart();
  await session.confirmFreshStart(review);
  assert.deepEqual(session.getProgress().completedChallengeIds, []);
  assert.equal(session.getView().dashboard.totalXp, 0);
  assert.equal(session.getView().dashboard.characterLevel, 1);
  assert.equal(session.getStatus().saved, true);
  assert.equal(session.getStatus().recoveryDataAvailable, false);
  assert.notEqual(h.raw, '{broken');
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, []);
});

test('a newer tab record arriving before reset confirmation cannot be overwritten', async () => {
  const h = harness('{broken');
  const recovery = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const review = recovery.previewFreshStart();
  h.replace(JSON.stringify({ schemaVersion: 1, bookEdition: 5, catalogRevision: 'test-revision', completedChallengeIds: ['fixed'], variableXpAwards: {}, internalWriteId: 'newer' }));
  await assert.rejects(recovery.confirmFreshStart(review), /changed|reload/i);
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, ['fixed']);
  assert.equal(recovery.getStatus().stale, true);
});

test('failed repair and session-only reset retain the original bytes, raw download, and unsaved warning', async () => {
  for (const options of [{ writeError: new Error('quota') }, { noLocks: true }]) {
    const original = '{broken';
    const h = harness(original, options);
    const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
    const review = session.previewFreshStart();
    await session.confirmFreshStart(review);
    assert.equal(session.getStatus().saved, false);
    assert.equal(session.getStatus().recoveryDataAvailable, true);
    assert.equal(session.exportRecoveryData().contents, original);
    assert.deepEqual(decodeProgressCsv(session.exportBackup().contents, catalog).completedChallengeIds, []);
    if (options.writeError) assert.equal(h.raw, original);
  }
});

test('a confirmed compatible import replaces invalid storage and releases raw-recovery availability only after a successful save', async () => {
  const h = harness('{broken');
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const preview = session.previewImport(encodeProgressCsv({ catalog,
    progress: { completedChallengeIds: ['fixed'], variableXpAwards: {} }, exportedAt: '2026-10-18T12:00:00.000Z' }));
  await session.confirmImport(preview);
  assert.equal(session.getStatus().recoveryDataAvailable, false);
  assert.equal(session.getStatus().saved, true);
  assert.equal(session.getView().dashboard.totalXp, 150);
});
