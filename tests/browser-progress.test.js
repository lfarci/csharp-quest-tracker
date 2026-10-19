import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserProgressSession, PROGRESS_STORAGE_KEY, PROGRESS_LOCK_NAME } from '../src/browser-progress.js';

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

function harness(initial = null, options = {}) {
  let raw = initial;
  let notify;
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const storage = {
    getItem(key) { assert.equal(key, PROGRESS_STORAGE_KEY); if (options.readError) throw options.readError; return raw; },
    setItem(key, value) { assert.equal(key, PROGRESS_STORAGE_KEY); if (options.writeError) throw options.writeError; raw = value; },
  };
  const lockManager = options.noLocks ? undefined : {
    request(name, callback) {
      assert.equal(name, PROGRESS_LOCK_NAME);
      if (options.lockError) return Promise.reject(options.lockError);
      return (async () => { if (options.hold) await held; return callback({ name }); })();
    },
  };
  return {
    options,
    adapters: { storage, lockManager, onStorageChange(listener) { notify = listener; return () => {}; }, createIdentity: (() => { let n = 0; return () => `identity-${++n}`; })() },
    get raw() { return raw; },
    notify(value, key = PROGRESS_STORAGE_KEY) { notify({ key, newValue: value }); },
    release() { release(); },
  };
}

test('new session begins empty and mutations persist only source progress plus an internal write identity', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  assert.equal(session.getView().dashboard.totalXp, 0);
  await session.setCompletion('fixed', true);
  const stored = JSON.parse(h.raw);
  assert.equal(stored.completedChallengeIds[0], 'fixed');
  assert.equal(stored.internalWriteId, 'identity-1');
  assert.equal('totalXp' in stored, false);
  assert.equal(session.getStatus().saved, true);
});

test('restores the selected award and derives XP and Character level from the catalog', async () => {
  const initial = JSON.stringify({ schemaVersion: 1, bookEdition: 5, catalogRevision: 'test-revision',
    completedChallengeIds: ['fixed', 'making-it-yours'], variableXpAwards: { 'making-it-yours': 237 }, internalWriteId: 'prior' });
  const h = harness(initial);
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  assert.equal(session.getView().dashboard.totalXp, 387);
  assert.equal(session.getView().dashboard.characterLevel, 2);
  assert.equal(session.getView().parts.flatMap(p => p.challenges).find(c => c.id === 'making-it-yours').selectedXpAward, 237);
  assert.equal(h.raw, initial);
});

test('same-tab intentions queue in order and a failed write leaves session usable and saved data intact', async () => {
  const h = harness(null, { hold: true });
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const one = session.setCompletion('fixed', true);
  const two = session.setCompletion('fixed', false);
  h.release();
  await Promise.all([one, two]);
  assert.deepEqual(session.getProgress().completedChallengeIds, []);

  h.options.hold = false;
  await session.setCompletion('fixed', true);
  const saved = h.raw;
  h.options.writeError = new Error('quota');
  await session.setCompletion('fixed', false);
  assert.deepEqual(session.getProgress().completedChallengeIds, []);
  assert.equal(h.raw, saved);
  assert.equal(session.getStatus().saved, false);
  h.options.writeError = null;
  await session.setCompletion('fixed', true);
  assert.equal(session.getStatus().saved, true);
});

test('inside-lock comparison rejects stale writes even when no storage event arrived', async () => {
  const h = harness();
  const a = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  const b = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await a.setCompletion('fixed', true);
  await assert.rejects(b.setCompletion('making-it-yours', true), /stale|reload/i);
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, ['fixed']);
  assert.equal(b.getStatus().stale, true);
});

test('external storage changes block further edits and require reload', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  h.notify('external');
  assert.equal(session.getStatus().stale, true);
  await assert.rejects(session.setCompletion('fixed', true), /stale|reload/i);
});

test('a storage-wide clear stales a tab even when its accepted value was initially empty', async () => {
  const h = harness();
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  h.notify(null, null);
  assert.equal(session.getStatus().stale, true);
  await assert.rejects(session.setCompletion('fixed', true), /stale|reload/i);
});

test('missing locks and storage failures fall back to usable session progress with an unsaved status', async () => {
  for (const options of [{ noLocks: true }, { lockError: new Error('denied') }, { writeError: new Error('quota') }, { readError: new Error('denied') }]) {
    const h = harness(null, options);
    const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
    await session.setCompletion('fixed', true);
    if (options.readError) {
      assert.equal(session.getView().dashboard, null);
      assert.deepEqual(session.getProgress().completedChallengeIds, ['fixed']);
    } else assert.equal(session.getView().dashboard.totalXp, 150);
    assert.equal(session.getStatus().saved, false);
    assert.equal(session.getStatus().hasUnsavedChanges, true);
    assert.match(session.getStatus().message, /isn't saved/i);
  }
});

test('unavailable storage hides only saved statistics, not session completions, filters, or pending awards', async () => {
  for (const adapters of [{}, harness(null, { readError: new Error('denied') }).adapters]) {
    const session = await createBrowserProgressSession({ catalog, adapters });
    assert.equal(session.getView().dashboard, null);
    assert.equal(session.getStatus().hasUnsavedChanges, false);
    await session.setCompletion('fixed', true);
    const completed = session.getView({ filter: 'completed' }).parts.flatMap(part => part.challenges);
    assert.deepEqual(completed.map(challenge => challenge.id), ['fixed']);
    assert.equal(completed[0].completed, true);
    assert.deepEqual(session.getView({ search: 'fixed', filter: 'remaining' }).parts, []);

    await session.setCompletion('making-it-yours', true);
    assert.equal(session.getView().pendingVariableChallengeId, 'making-it-yours');
    await session.submitVariableAward('making-it-yours', 237);
    const challenge = session.getView({ search: 'making', filter: 'completed' }).parts[0].challenges[0];
    assert.equal(challenge.completed, true);
    assert.equal(challenge.selectedXpAward, 237);
    assert.equal(session.getView().pendingVariableChallengeId, null);
    assert.equal(session.getView().dashboard, null);
    assert.equal(session.getStatus().hasUnsavedChanges, true);
  }
});

test('unsaved changes track source progress, not pending interactions or completion ordering', async () => {
  const session = await createBrowserProgressSession({ catalog });
  await session.setCompletion('making-it-yours', true);
  assert.equal(session.getStatus().hasUnsavedChanges, false);
  session.cancelVariableAward();
  await session.setCompletion('fixed', true);
  assert.equal(session.getStatus().hasUnsavedChanges, true);
  await session.setCompletion('fixed', false);
  assert.equal(session.getStatus().hasUnsavedChanges, false);

  const h = harness();
  const savedSession = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await savedSession.setCompletion('fixed', true);
  await savedSession.setCompletion('making-it-yours', true);
  await savedSession.submitVariableAward('making-it-yours', 237);
  assert.equal(savedSession.getStatus().hasUnsavedChanges, false);
  h.options.writeError = new Error('quota');
  await savedSession.setCompletion('fixed', false);
  assert.equal(savedSession.getStatus().hasUnsavedChanges, true);
  await savedSession.setCompletion('fixed', true);
  assert.equal(savedSession.getStatus().hasUnsavedChanges, false);
  await savedSession.setCompletion('making-it-yours', false);
  await savedSession.setCompletion('making-it-yours', true);
  await savedSession.submitVariableAward('making-it-yours', 300);
  assert.equal(savedSession.getStatus().hasUnsavedChanges, true);
  h.options.writeError = null;
  await savedSession.setCompletion('fixed', true);
  assert.equal(savedSession.getStatus().hasUnsavedChanges, false);
});

test('a successful save after storage becomes readable restores reliable statistics', async () => {
  const h = harness(null, { readError: new Error('denied') });
  const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
  await session.setCompletion('fixed', true);
  assert.equal(session.getView().dashboard, null);
  assert.equal(session.getStatus().hasUnsavedChanges, true);
  h.options.readError = null;
  await session.setCompletion('fixed', true);
  assert.equal(session.getView().dashboard.totalXp, 150);
  assert.equal(session.getStatus().saved, true);
  assert.equal(session.getStatus().hasUnsavedChanges, false);
});

test('malformed and incompatible storage are preserved and expose recovery-needed without fabricated statistics', async () => {
  for (const raw of ['{broken', JSON.stringify({ schemaVersion: 9, bookEdition: 5, catalogRevision: 'test-revision',
    completedChallengeIds: [], variableXpAwards: {}, internalWriteId: 'future' })]) {
    const h = harness(raw);
    const session = await createBrowserProgressSession({ catalog, adapters: h.adapters });
    assert.equal(session.getStatus().recoveryNeeded, true);
    assert.equal(session.getView(), null);
    await assert.rejects(session.setCompletion('fixed', true), /recovery/i);
    assert.equal(h.raw, raw);
  }
});
