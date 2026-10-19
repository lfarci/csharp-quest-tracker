import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { activityTypes, getActivityType, getBossBattleIds } from '../src/activity-types.js';

const catalog = JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8'));

test('every supplied Boss Battle matches a catalog entry, with no duplicate or unknown IDs', () => {
  const bosses = getBossBattleIds();
  const allIds = new Set(catalog.challenges.map(challenge => challenge.id));
  assert.equal(bosses.size, 35);
  for (const id of bosses) assert.ok(allIds.has(id), `Unknown Boss Battle ${id}`);
});

test('114 activities classify as 35 Boss Battles, 19 Knowledge Checks and 60 Challenges', () => {
  const counts = { challenge: 0, 'boss-battle': 0, 'knowledge-check': 0 };
  for (const challenge of catalog.challenges) {
    const type = getActivityType(challenge);
    assert.ok(activityTypes[type]);
    counts[type]++;
    if (type === 'knowledge-check') assert.match(challenge.title, /^Knowledge Check - /);
    if (type === 'boss-battle') assert.ok(getBossBattleIds().has(challenge.id));
  }
  assert.deepEqual(counts, { challenge: 60, 'boss-battle': 35, 'knowledge-check': 19 });
});

test('activity type is independent of fixed or variable XP and catalog revision', () => {
  const variable = catalog.challenges.find(challenge => challenge.id === 'making-it-yours');
  assert.equal(getActivityType(variable), 'boss-battle');
  assert.equal(variable.reward.kind, 'variable');
  assert.equal(catalog.revision, '5e-2026-10-18');
  assert.equal(getActivityType({ id: 'example', title: 'Example' }), 'challenge');
});
