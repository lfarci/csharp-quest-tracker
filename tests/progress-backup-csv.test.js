import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeProgressCsv, encodeProgressCsv } from '../src/progress-backup-csv.js';

const catalog = {
  bookEdition: 5, revision: 'test-revision',
  parts: [{ id: 1, title: 'Part 1' }], levelThresholds: [0, 200],
  challenges: [
    { id: 'fixed', title: 'A, "quoted" Challenge', bookPart: 1, page: 1, order: 1, reward: { kind: 'fixed', xp: 150 } },
    { id: 'making-it-yours', title: 'Expansion: Making it Yours', bookPart: 1, page: 2, order: 2,
      reward: { kind: 'variable', notation: '?', minimum: 50, maximum: 400 } },
  ],
};
const exportedAt = '2026-10-18T12:00:00.000Z';

test('CSV round-trips all Challenges, selected awards, and escaped titles', () => {
  const contents = encodeProgressCsv({ catalog, progress: {
    completedChallengeIds: ['fixed', 'making-it-yours'], variableXpAwards: { 'making-it-yours': 237 },
  }, exportedAt });
  assert.ok(contents.startsWith('schemaVersion,bookEdition,catalogRevision,exportedAt,challengeId,challengeTitle,completed,selectedXpAward\r\n'));
  assert.match(contents, /"A, ""quoted"" Challenge"/);
  assert.equal(contents.split('\r\n').length, catalog.challenges.length + 2);
  assert.deepEqual(decodeProgressCsv(contents, catalog), {
    schemaVersion: 1, bookEdition: 5, catalogRevision: 'test-revision', exportedAt,
    completedChallengeIds: ['fixed', 'making-it-yours'], variableXpAwards: { 'making-it-yours': 237 },
  });
});

test('CSV imports an empty tracker while retaining every Challenge row', () => {
  const contents = encodeProgressCsv({ catalog, progress: { completedChallengeIds: [], variableXpAwards: {} }, exportedAt });
  const decoded = decodeProgressCsv(contents, catalog);
  assert.deepEqual(decoded.completedChallengeIds, []);
  assert.deepEqual(decoded.variableXpAwards, {});
  assert.equal(contents.split('\r\n').length, catalog.challenges.length + 2);
});

test('CSV rejects malformed quoting, missing and duplicate Challenges, and inconsistent metadata', () => {
  const valid = encodeProgressCsv({ catalog, progress: { completedChallengeIds: [], variableXpAwards: {} }, exportedAt });
  const rows = valid.trimEnd().split('\r\n');
  assert.throws(() => decodeProgressCsv(`${rows[0]}\r\n"unterminated`, catalog), /unterminated|incomplete/i);
  assert.throws(() => decodeProgressCsv(`${rows[0]}\r\n${rows[1]}`, catalog), /incomplete|missing/i);
  assert.throws(() => decodeProgressCsv(`${rows[0]}\r\n${rows[1]}\r\n${rows[1]}`, catalog), /duplicate/i);
  rows[2] = rows[2].replace('test-revision', 'other-revision');
  assert.throws(() => decodeProgressCsv(rows.join('\r\n'), catalog), /inconsistent/i);
});

test('CSV rejects unsupported versions, editions, timestamps, and completion values', () => {
  const valid = encodeProgressCsv({ catalog, progress: { completedChallengeIds: [], variableXpAwards: {} }, exportedAt });
  for (const [from, to, pattern] of [
    ['1,5,test-revision', '2,5,test-revision', /different edition|invalid/i],
    ['1,5,test-revision', '1,4,test-revision', /different edition|invalid/i],
    [exportedAt, 'not-a-timestamp', /different edition|invalid/i],
    ['false,', 'maybe,', /completion value/i],
  ]) {
    const invalid = valid.replaceAll(from, to);
    assert.throws(() => decodeProgressCsv(invalid, catalog), pattern);
  }
  assert.deepEqual(decodeProgressCsv(`\uFEFF${valid}`, catalog).completedChallengeIds, []);
});
