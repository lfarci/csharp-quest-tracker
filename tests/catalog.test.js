import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateCatalog } from '../src/catalog.js';

const catalog = JSON.parse(
  await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8')
);

test('the verified fifth-edition catalog passes without mutation', () => {
  const copy = structuredClone(catalog);

  assert.equal(validateCatalog(copy), undefined);
  assert.deepEqual(copy, catalog);
});

const invalidCases = [
  ['missing catalog', () => null],
  ['unsupported edition', copy => { copy.bookEdition = 4; }],
  ['blank revision', copy => { copy.revision = '  '; }],
  ['missing parts', copy => { copy.parts = []; }],
  ['duplicate part ID', copy => { copy.parts[1].id = copy.parts[0].id; }],
  ['blank part title', copy => { copy.parts[0].title = ''; }],
  ['missing thresholds', copy => { copy.levelThresholds = []; }],
  ['out-of-order thresholds', copy => { copy.levelThresholds[2] = 1; }],
  ['duplicate challenge ID', copy => { copy.challenges[1].id = copy.challenges[0].id; }],
  ['invalid challenge ID', copy => { copy.challenges[0].id = 'Not A Slug'; }],
  ['challenge without a page', copy => { copy.challenges[0].page = 0; }],
  ['challenge out of order', copy => { copy.challenges[0].order = 2; }],
  ['challenge in a missing part', copy => { copy.challenges[0].bookPart = 99; }],
  ['missing reward', copy => { copy.challenges[0].reward = null; }],
  ['invalid fixed reward', copy => { copy.challenges[0].reward.xp = 0; }],
  ['invalid variable reward', copy => {
    const entry = copy.challenges.find(challenge => challenge.id === 'making-it-yours');
    entry.reward.maximum = 401;
  }],
];

for (const [description, invalidate] of invalidCases) {
  test(`catalog rejects ${description}`, () => {
    const copy = structuredClone(catalog);
    const result = invalidate(copy);
    const candidate = result === undefined ? copy : result;

    assert.throws(() => validateCatalog(candidate), /Challenge catalog is invalid/);
  });
}
