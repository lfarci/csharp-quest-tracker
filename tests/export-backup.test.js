import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressSession } from '../src/progress-session.js';
import { decodeProgressCsv } from '../src/progress-backup-csv.js';

const catalog = {
  bookEdition: 5, revision: 'test-revision',
  parts: [1, 2, 3, 4, 5].map(id => ({ id, title: `Book part ${id}` })),
  levelThresholds: [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000],
  challenges: [
    { id: 'fixed-challenge', title: 'Fixed Challenge', bookPart: 1, page: 1, order: 1, reward: { kind: 'fixed', xp: 150 } },
    { id: 'making-it-yours', title: 'Expansion: Making it Yours', bookPart: 4, page: 2, order: 2,
      reward: { kind: 'variable', notation: '?', minimum: 50, maximum: 400 } },
  ],
};

test('empty session exports a timestamped portable backup without changing progress', () => {
  const session = createProgressSession({ catalog });
  const before = session.getView();
  const startedAt = Date.now();
  const backup = session.exportBackup();
  const exported = decodeProgressCsv(backup.contents, catalog);
  assert.match(backup.filename, /^csharp-quest-tracker-5e-progress-\d{4}-\d{2}-\d{2}T[\d-]+Z\.csv$/);
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.bookEdition, 5);
  assert.equal(exported.catalogRevision, 'test-revision');
  assert.deepEqual(exported.completedChallengeIds, []);
  assert.deepEqual(exported.variableXpAwards, {});
  assert.equal(new Date(exported.exportedAt).toISOString(), exported.exportedAt);
  assert.ok(Date.parse(exported.exportedAt) >= startedAt);
  assert.ok(Date.parse(exported.exportedAt) <= Date.now());
  assert.deepEqual(session.getView(), before);
});

test('a mixed-reward backup preserves stable IDs and the chosen award exactly once', () => {
  const session = createProgressSession({ catalog });
  session.setCompletion('fixed-challenge', true);
  session.setCompletion('fixed-challenge', true);
  session.setCompletion('making-it-yours', true);
  session.submitVariableAward('making-it-yours', 237);
  const progressBefore = session.getProgress();
  const viewBefore = session.getView();
  const exported = decodeProgressCsv(session.exportBackup().contents, catalog);
  assert.deepEqual(exported.completedChallengeIds, ['fixed-challenge', 'making-it-yours']);
  assert.deepEqual(exported.variableXpAwards, { 'making-it-yours': 237 });
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.bookEdition, 5);
  assert.equal(exported.catalogRevision, 'test-revision');
  assert.equal(exported.completedChallengeIds.length, 2);
  assert.equal('totalXp' in exported, false);
  assert.equal('characterLevel' in exported, false);
  assert.equal('pendingVariableChallengeId' in exported, false);
  assert.deepEqual(session.getProgress(), progressBefore);
  assert.deepEqual(session.getView(), viewBefore);
});

test('export during award selection preserves the unfinished interaction and excludes its pending state', () => {
  const session = createProgressSession({ catalog });
  session.setCompletion('making-it-yours', true);
  const exported = decodeProgressCsv(session.exportBackup().contents, catalog);
  assert.deepEqual(exported.completedChallengeIds, []);
  assert.deepEqual(exported.variableXpAwards, {});
  assert.equal('pendingVariableChallengeId' in exported, false);
  assert.equal(session.getView().pendingVariableChallengeId, 'making-it-yours');
});
