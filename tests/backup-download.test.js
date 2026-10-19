import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadProgressBackup, downloadRecoveryData } from '../src/backup-download.js';

test('recovery download preserves exact text, filename, and cleanup', async t => {
  const contents = '{damaged\r\n\u0000';
  let blob;
  const calls = [];
  const anchor = { click: () => calls.push('click'), remove: () => calls.push('remove') };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true,
    value: { createElement: () => anchor, body: { append: () => calls.push('append') } } });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else delete globalThis.document;
  });
  t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:recovery'; });
  t.mock.method(URL, 'revokeObjectURL', value => calls.push(value));
  t.mock.method(globalThis, 'setTimeout', callback => callback());
  const session = { exportRecoveryData: () => ({ filename: 'recovery.txt', contents }) };
  assert.equal(downloadRecoveryData(session), 'recovery.txt');
  assert.equal(await blob.text(), contents);
  assert.equal(blob.type, 'text/plain;charset=utf-8');
  assert.equal(anchor.href, 'blob:recovery');
  assert.equal(anchor.download, 'recovery.txt');
  assert.equal(anchor.hidden, true);
  assert.deepEqual(calls, ['append', 'click', 'remove', 'blob:recovery']);

  calls.length = 0;
  anchor.click = () => { throw new Error('download blocked'); };
  assert.throws(() => downloadRecoveryData(session), /download blocked/);
  assert.deepEqual(calls, ['append', 'remove', 'blob:recovery']);
});

test('ordinary backup refuses unavailable progress rather than downloading a fabricated record', () => {
  assert.throws(() => downloadProgressBackup({ exportBackup: () => null }), /needs recovery/);
});
