import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateCatalog } from '../src/catalog.js';

const catalog = JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8'));

// User-supplied Boss Battles, independently checked against the JSON types.
const expectedBossBattleIds = new Set([
  'hunting-the-manticore',
  'the-point',
  'the-color',
  'the-card',
  'the-locked-door',
  'the-password-validator',
  'rock-paper-scissors',
  '15-puzzle',
  'hangman',
  'tic-tac-toe',
  'the-fountain-of-objects',
  'small-medium-or-large',
  'pits',
  'maelstroms',
  'amaroks',
  'getting-armed',
  'getting-help',
  'core-game-building-character',
  'core-game-the-true-programmer',
  'core-game-actions-and-players',
  'core-game-attacks',
  'core-game-damage-and-hp',
  'core-game-death',
  'core-game-battle-series',
  'core-game-the-uncoded-one',
  'core-game-the-player-decides',
  'expansion-the-game-s-status',
  'expansion-items',
  'expansion-gear',
  'expansion-stolen-inventory',
  'expansion-vin-fletcher',
  'expansion-attack-modifiers',
  'expansion-damage-types',
  'making-it-yours',
  'expansion-restoring-balance',
]);

test('all 114 catalog entries have explicit and valid activity types', () => {
  assert.doesNotThrow(() => validateCatalog(catalog));
  const counts = { challenge: 0, 'boss-battle': 0, 'knowledge-check': 0 };
  for (const challenge of catalog.challenges) {
    assert.ok(Object.prototype.hasOwnProperty.call(counts, challenge.type), `Missing or invalid type: ${challenge.id}`);
    counts[challenge.type]++;
  }
  assert.deepEqual(counts, { challenge: 60, 'boss-battle': 35, 'knowledge-check': 19 });
});

test('Boss Battles match the supplied list and Knowledge Checks match their titles', () => {
  const actualBossBattleIds = new Set(catalog.challenges
    .filter(challenge => challenge.type === 'boss-battle')
    .map(challenge => challenge.id));
  assert.deepEqual(actualBossBattleIds, expectedBossBattleIds);
  for (const challenge of catalog.challenges) {
    if (challenge.type === 'knowledge-check') {
      assert.match(challenge.title, /^Knowledge Check - /);
    }
  }
});

test('activity types preserve the catalog revision and XP rules', () => {
  const variable = catalog.challenges.find(challenge => challenge.id === 'making-it-yours');
  assert.equal(variable.type, 'boss-battle');
  assert.equal(variable.reward.kind, 'variable');
  assert.equal(catalog.revision, '5e-2026-10-18');
});

test('catalog rejects unsupported activity types', () => {
  const invalid = structuredClone(catalog);
  invalid.challenges[0].type = 'invented';
  assert.throws(() => validateCatalog(invalid), /catalog is invalid/);
});
