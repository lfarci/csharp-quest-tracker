import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadBrowserProgressSession } from '../src/browser-session.js';
import { downloadProgressBackup } from '../src/backup-download.js';
import { decodeProgressCsv } from '../src/progress-backup-csv.js';

const catalog = JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8'));
const fixed = catalog.challenges.find(challenge => challenge.reward.kind === 'fixed');

function replaceGlobal(t, name, value) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, value });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original);
    else delete globalThis[name];
  });
}

function browser(t, options = {}) {
  let raw = null;
  const events = new EventTarget();
  const storage = {
    getItem: () => raw,
    setItem(_key, value) {
      if (options.writeError) throw new Error('quota');
      raw = value;
    },
  };
  replaceGlobal(t, 'window', {
    get localStorage() {
      if (options.noStorage) throw new Error('denied');
      return storage;
    },
    addEventListener: (...args) => events.addEventListener(...args),
    removeEventListener: (...args) => events.removeEventListener(...args),
  });
  replaceGlobal(t, 'navigator', {
    get locks() {
      if (options.noLocks) throw new Error('unavailable');
      return { request: async (_name, callback) => callback() };
    },
  });
  t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url.pathname.endsWith('/data/catalog.json'), true);
    return { ok: true, json: async () => structuredClone(catalog) };
  });
  return {
    get raw() { return raw; },
    beforeLeaving() {
      const event = new Event('beforeunload', { cancelable: true });
      events.dispatchEvent(event);
      return event.defaultPrevented;
    },
    changeStorage() { events.dispatchEvent(Object.assign(new Event('storage'), { key: null })); },
  };
}

test('browser setup connects storage, locking, and stale-state notifications without warning on saved changes', async t => {
  const h = browser(t);
  const statuses = [];
  const loaded = await loadBrowserProgressSession(status => statuses.push(status));
  assert.deepEqual(loaded.catalog, catalog);
  assert.equal(h.beforeLeaving(), false);
  await loaded.session.setCompletion(fixed.id, true);
  assert.deepEqual(JSON.parse(h.raw).completedChallengeIds, [fixed.id]);
  assert.equal(h.beforeLeaving(), false);
  h.changeStorage();
  assert.equal(statuses.at(-1).stale, true);
  assert.equal(h.beforeLeaving(), false);
});

for (const options of [{ noLocks: true }, { writeError: true }, { noStorage: true }]) {
  test(`current-page backup retains unsaved progress and navigation warns: ${JSON.stringify(options)}`, async t => {
    const h = browser(t, options);
    const { session } = await loadBrowserProgressSession();
    assert.equal(h.beforeLeaving(), false);
    await session.setCompletion(fixed.id, true);
    assert.equal(h.beforeLeaving(), true);

    let downloaded;
    const anchor = { click() {}, remove() {} };
    replaceGlobal(t, 'document', { createElement: () => anchor, body: { append() {} } });
    t.mock.method(URL, 'createObjectURL', blob => { downloaded = blob; return 'blob:test'; });
    t.mock.method(URL, 'revokeObjectURL', () => {});
    t.mock.method(globalThis, 'setTimeout', callback => { callback(); });
    const filename = downloadProgressBackup(session);
    const progress = decodeProgressCsv(await downloaded.text(), catalog);
    assert.deepEqual(progress.completedChallengeIds, [fixed.id]);
    assert.equal(anchor.download, filename);
    assert.equal(downloaded.type, 'text/csv;charset=utf-8');
    assert.equal(h.raw, null);
    assert.equal(h.beforeLeaving(), true, 'downloading does not pretend browser storage was repaired');

    await session.setCompletion(fixed.id, false);
    assert.equal(h.beforeLeaving(), false);
  });
}

test('a successful retry removes the unsaved navigation warning', async t => {
  const options = { writeError: true };
  const h = browser(t, options);
  const { session } = await loadBrowserProgressSession();
  await session.setCompletion(fixed.id, true);
  assert.equal(h.beforeLeaving(), true);
  options.writeError = false;
  await session.setCompletion(fixed.id, true);
  assert.equal(h.beforeLeaving(), false);
  assert.equal(session.getStatus().saved, true);
});

test('catalog loading failures do not start a session', async t => {
  browser(t);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
  await assert.rejects(loadBrowserProgressSession(), /catalog could not be downloaded/i);
});
