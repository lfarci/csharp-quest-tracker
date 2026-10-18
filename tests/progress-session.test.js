import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createProgressSession } from '../src/progress-session.js';

const catalog = JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8'));

test('a reader starts with the full official checklist and no progress', () => {
  const session = createProgressSession({ catalog });
  const view = session.getView();
  assert.equal(view.dashboard.totalXp, 0);
  assert.equal(view.dashboard.characterLevel, 1);
  assert.equal(view.dashboard.completedCount, 0);
  assert.equal(view.dashboard.challengeCount, 114);
  assert.equal(view.dashboard.trackerCompletion, 0);
  assert.equal(view.dashboard.xpRemaining, 200);
  assert.equal(view.dashboard.levelProgress, 0);
  assert.deepEqual(view.parts.map(part => part.challenges.length), [27, 33, 33, 18, 3]);
  assert.equal(view.parts[3].challenges[16].id, 'making-it-yours');
});

test('fixed Challenges complete in any order, contribute once, and remove XP when unchecked', () => {
  const session = createProgressSession({ catalog });
  session.setCompletion('knowledge-check-debugging', true);
  session.setCompletion('the-fountain-of-objects', true);
  session.setCompletion('the-fountain-of-objects', true);
  assert.equal(session.getView().dashboard.totalXp, 525);
  assert.equal(session.getView().dashboard.characterLevel, 2);
  assert.equal(session.getView().dashboard.completedCount, 2);
  assert.equal(session.getView().dashboard.trackerCompletion, 2 / 114);
  assert.equal(session.getView().dashboard.xpRemaining, 75);
  assert.equal(session.getView().dashboard.levelProgress, 325 / 400);
  session.setCompletion('the-fountain-of-objects', false);
  assert.equal(session.getView().dashboard.totalXp, 25);
  assert.equal(session.getView().dashboard.characterLevel, 1);
  assert.equal(session.getView().dashboard.completedCount, 1);
  assert.equal(session.getView().parts[4].challenges[2].completed, true);
});

test('initial completion identifiers are a set and the progress record contains no derived totals', () => {
  const session = createProgressSession({ catalog,
    progress: { completedChallengeIds: ['hello-world', 'hello-world'] } });
  assert.equal(session.getView().dashboard.totalXp, 50);
  assert.equal(session.getView().dashboard.completedCount, 1);
  assert.deepEqual(session.getProgress(), {
    schemaVersion: 1, bookEdition: 5, catalogRevision: '5e-2026-10-18',
    completedChallengeIds: ['hello-world'], variableXpAwards: {},
  });
});

test('unsupported completion commands leave the session unchanged', () => {
  const session = createProgressSession({ catalog });
  assert.throws(() => session.setCompletion('missing-id', true), /Unknown Challenge/);
  assert.throws(() => session.setCompletion('hello-world', 'yes'), /boolean/);
  assert.equal(session.getView().dashboard.totalXp, 0);
  assert.equal(session.getView().dashboard.completedCount, 0);
  assert.throws(() => createProgressSession({ catalog,
    progress: { completedChallengeIds: ['missing-id'] } }), /Unknown Challenge/);
});

// These literals come from the PDF ladder's cumulative totals, not application calculations.
for (const [level, threshold, belowLevel] of [
  [2, 200, 1], [3, 600, 2], [4, 1200, 3], [5, 2000, 4], [6, 3000, 5],
  [7, 4200, 6], [8, 5600, 7], [9, 7200, 8], [10, 9000, 9],
]) {
  test(`Character level ${level} starts at ${threshold} XP`, () => {
    const fixture = structuredClone(catalog);
    fixture.challenges[0].reward.xp = threshold - 1;
    const session = createProgressSession({ catalog: fixture });
    session.setCompletion('knowledge-check-c', true);
    assert.equal(session.getView().dashboard.characterLevel, belowLevel);
    assert.equal(session.getView().dashboard.xpRemaining, 1);
    fixture.challenges[0].reward.xp = threshold;
    const boundary = createProgressSession({ catalog: fixture });
    boundary.setCompletion('knowledge-check-c', true);
    assert.equal(boundary.getView().dashboard.characterLevel, level);
    assert.equal(boundary.getView().dashboard.levelProgress, level === 10 ? 1 : 0);
  });
}

test('Maximum level stays full while XP continues accumulating', () => {
  const session = createProgressSession({ catalog });
  for (const challenge of catalog.challenges.filter(challenge => challenge.reward.kind === 'fixed')) {
    session.setCompletion(challenge.id, true);
  }
  const dashboard = session.getView().dashboard;
  assert.equal(dashboard.totalXp, 11700);
  assert.equal(dashboard.characterLevel, 10);
  assert.equal(dashboard.maximumLevel, true);
  assert.equal(dashboard.levelProgress, 1);
  assert.equal(dashboard.xpRemaining, null);
  assert.equal(dashboard.completedCount, 113);
  assert.equal(dashboard.trackerCompletion, 113 / 114);
});

test('an invalid catalog is rejected instead of presenting fabricated progress', () => {
  for (const invalidate of [
    copy => copy.challenges.push(structuredClone(copy.challenges[0])),
    copy => { copy.challenges[0].reward.xp = -1; },
    copy => { copy.challenges[0].order = 99; },
    copy => { copy.challenges[0].bookPart = 9; },
    copy => { copy.levelThresholds[2] = 199; },
    copy => { copy.challenges[0].page = 0; },
    copy => { copy.challenges.find(challenge => challenge.id === 'making-it-yours').reward.minimum = 0; },
  ]) {
    const invalid = structuredClone(catalog);
    invalidate(invalid);
    assert.throws(() => createProgressSession({ catalog: invalid }), /catalog/i);
  }
});

test('editing a returned view or progress record cannot change the active session', () => {
  const session = createProgressSession({ catalog });
  session.getView().parts[0].challenges[2].reward.xp = 9999;
  session.getProgress().completedChallengeIds.push('hello-world');
  session.setCompletion('hello-world', true);
  assert.equal(session.getView().dashboard.totalXp, 50);
  assert.equal(session.getView().dashboard.completedCount, 1);
});

function discoveryCatalog() {
  return {
    bookEdition: 5, revision: 'discovery-fixture',
    levelThresholds: [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000],
    parts: [
      { id: 1, title: 'The Basics' }, { id: 2, title: 'Objects' },
      { id: 3, title: 'Advanced Features' }, { id: 4, title: 'The Endgame' },
      { id: 5, title: 'Bonus Levels' },
    ],
    challenges: [
      { id: 'arrow-trial', title: 'Arrow Trial', bookPart: 1, page: 10, order: 1, reward: { kind: 'fixed', xp: 25 } },
      { id: 'clock-tower', title: 'Clock Tower', bookPart: 1, page: 20, order: 2, reward: { kind: 'fixed', xp: 75 } },
      { id: 'arrow-factory', title: 'Arrow Factory', bookPart: 2, page: 30, order: 3, reward: { kind: 'fixed', xp: 150 } },
      { id: 'final-arrow', title: 'Final Arrow', bookPart: 3, page: 40, order: 4, reward: { kind: 'fixed', xp: 200 } },
      { id: 'making-it-yours', title: 'Expansion: Making it Yours', bookPart: 4, page: 50, order: 5,
        reward: { kind: 'variable', notation: '?', minimum: 50, maximum: 400 } },
      { id: 'bonus-check', title: 'Bonus Check', bookPart: 5, page: 60, order: 6, reward: { kind: 'fixed', xp: 50 } },
    ],
  };
}

test('title search is case-insensitive, trims whitespace, and preserves matching Book parts and official order', () => {
  const session = createProgressSession({ catalog: discoveryCatalog() });
  const view = session.getView({ search: '  ARROW  ' });
  assert.deepEqual(view.parts.map(part => [part.id, part.challenges.map(challenge => challenge.id)]), [
    [1, ['arrow-trial']], [2, ['arrow-factory']], [3, ['final-arrow']],
  ]);
  assert.deepEqual(session.getView({ search: 'missing title' }).parts, []);
  assert.equal(session.getView({ search: '   ' }).parts.length, 5);
});

test('completion filters combine with search and update when a visible Challenge changes', () => {
  const session = createProgressSession({ catalog: discoveryCatalog() });
  session.setCompletion('final-arrow', true);
  session.setCompletion('arrow-trial', true);
  assert.deepEqual(session.getView({ search: 'arrow', filter: 'completed' }).parts
    .flatMap(part => part.challenges.map(challenge => challenge.id)), ['arrow-trial', 'final-arrow']);
  assert.deepEqual(session.getView({ search: 'arrow', filter: 'remaining' }).parts
    .flatMap(part => part.challenges.map(challenge => challenge.id)), ['arrow-factory']);
  session.setCompletion('arrow-factory', true);
  assert.deepEqual(session.getView({ search: 'arrow', filter: 'remaining' }).parts, []);
  session.setCompletion('arrow-trial', false);
  assert.deepEqual(session.getView({ search: 'arrow', filter: 'remaining' }).parts
    .flatMap(part => part.challenges.map(challenge => challenge.id)), ['arrow-trial']);
});

test('view controls leave all-entry dashboard totals and exportable progress unchanged', () => {
  const session = createProgressSession({ catalog: discoveryCatalog() });
  session.setCompletion('arrow-trial', true);
  session.setCompletion('bonus-check', true);
  const progress = session.getProgress();
  for (const options of [
    { search: 'arrow', filter: 'all' }, { filter: 'completed' },
    { search: 'absent', filter: 'remaining' }, { search: '  ', filter: 'all' },
  ]) {
    const { dashboard } = session.getView(options);
    assert.equal(dashboard.totalXp, 75);
    assert.equal(dashboard.characterLevel, 1);
    assert.equal(dashboard.completedCount, 2);
    assert.equal(dashboard.challengeCount, 6);
    assert.equal(dashboard.trackerCompletion, 2 / 6);
    assert.deepEqual(session.getProgress(), progress);
  }
  assert.equal(session.getView().parts.flatMap(part => part.challenges).length, 6);
});

const variableCatalog = {
  bookEdition: 5, revision: 'test-revision',
  parts: [1, 2, 3, 4, 5].map(id => ({ id, title: `Book part ${id}` })),
  levelThresholds: [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000],
  challenges: [
    { id: 'hello-world', title: 'Fixed Challenge', bookPart: 1, page: 1, order: 1, reward: { kind: 'fixed', xp: 150 } },
    { id: 'making-it-yours', title: 'Expansion: Making it Yours', bookPart: 4, page: 2, order: 2,
      reward: { kind: 'variable', notation: '?', minimum: 50, maximum: 400 } },
  ],
};

test('choosing the variable-reward Challenge requests an award without changing progress, and cancel leaves progress unchanged', () => {
  const session = createProgressSession({ catalog: variableCatalog });
  session.setCompletion('hello-world', true);
  const before = session.getProgress();
  session.setCompletion('making-it-yours', true);
  assert.equal(session.getView().pendingVariableChallengeId, 'making-it-yours');
  assert.deepEqual(session.getProgress(), before);
  session.cancelVariableAward();
  assert.equal(session.getView().pendingVariableChallengeId, null);
  assert.deepEqual(session.getProgress(), before);
});

for (const [award, expectedTotal] of [[50, 200], [237, 387], [400, 550]]) {
  test(`a ${award} XP variable award completes once and contributes to Character level`, () => {
    const session = createProgressSession({ catalog: variableCatalog });
    session.setCompletion('hello-world', true);
    session.setCompletion('making-it-yours', true);
    session.submitVariableAward('making-it-yours', award);
    assert.equal(session.getView().pendingVariableChallengeId, null);
    assert.equal(session.getView().dashboard.totalXp, expectedTotal);
    assert.equal(session.getView().dashboard.characterLevel, 2);
    assert.equal(session.getView().dashboard.completedCount, 2);
    assert.equal(session.getView().dashboard.trackerCompletion, 1);
    assert.equal(session.getView().parts.flatMap(part => part.challenges).find(challenge => challenge.id === 'making-it-yours').selectedXpAward, award);
    assert.deepEqual(session.getProgress().variableXpAwards, { 'making-it-yours': award });
    session.setCompletion('making-it-yours', true);
    assert.equal(session.getView().pendingVariableChallengeId, null);
    assert.equal(session.getView().dashboard.totalXp, expectedTotal);
  });
}

test('missing, fractional, out-of-range, and incorrectly typed awards leave progress unchanged', () => {
  for (const award of [undefined, null, '', '50', 49, 401, 50.5, NaN, Infinity, true, {}, []]) {
    const session = createProgressSession({ catalog: variableCatalog });
    session.setCompletion('making-it-yours', true);
    const before = session.getProgress();
    assert.throws(() => session.submitVariableAward('making-it-yours', award), /whole number.*50.*400/i);
    assert.deepEqual(session.getProgress(), before);
    assert.equal(session.getView().pendingVariableChallengeId, 'making-it-yours');
  }
});

test('unchecking removes the chosen award and rechecking asks for a new one', () => {
  const session = createProgressSession({ catalog: variableCatalog });
  session.setCompletion('hello-world', true);
  session.setCompletion('making-it-yours', true);
  session.submitVariableAward('making-it-yours', 237);
  session.setCompletion('making-it-yours', false);
  assert.equal(session.getView().dashboard.totalXp, 150);
  assert.equal(session.getView().dashboard.characterLevel, 1);
  assert.equal(session.getView().parts.flatMap(part => part.challenges).find(challenge => challenge.id === 'making-it-yours').selectedXpAward, null);
  assert.deepEqual(session.getProgress().variableXpAwards, {});
  session.setCompletion('making-it-yours', true);
  assert.equal(session.getView().pendingVariableChallengeId, 'making-it-yours');
  assert.equal(session.getView().dashboard.completedCount, 1);
  assert.deepEqual(session.getProgress().variableXpAwards, {});
  session.submitVariableAward('making-it-yours', 50);
  assert.equal(session.getView().dashboard.totalXp, 200);
  assert.throws(() => session.submitVariableAward('making-it-yours', 400), /Choose.*Challenge/i);
  assert.equal(session.getView().dashboard.totalXp, 200);
});

test('a complete variable award restores through the session record and remains isolated from returned records', () => {
  const session = createProgressSession({ catalog: variableCatalog, progress: {
    completedChallengeIds: ['making-it-yours', 'making-it-yours'],
    variableXpAwards: { 'making-it-yours': 237 },
  } });
  assert.equal(session.getView().dashboard.totalXp, 237);
  assert.equal(session.getView().dashboard.completedCount, 1);
  session.getProgress().variableXpAwards['making-it-yours'] = 400;
  assert.equal(session.getView().dashboard.totalXp, 237);
});

test('award data cannot complete an entry implicitly or override a fixed reward', () => {
  for (const progress of [
    { completedChallengeIds: ['making-it-yours'] },
    { variableXpAwards: { 'making-it-yours': 50 } },
    { completedChallengeIds: ['hello-world'], variableXpAwards: { 'hello-world': 400 } },
    { completedChallengeIds: ['making-it-yours'], variableXpAwards: { 'making-it-yours': '50' } },
    { variableXpAwards: [] },
  ]) assert.throws(() => createProgressSession({ catalog: variableCatalog, progress }), /award|whole number/i);
  const session = createProgressSession({ catalog: variableCatalog });
  session.setCompletion('making-it-yours', true);
  assert.throws(() => session.submitVariableAward('hello-world', 400), /variable-reward Challenge/i);
  assert.equal(session.getView().dashboard.totalXp, 0);
});

test('variable award completion and removal update the filtered view without hiding pending state or changing total semantics', () => {
  const session = createProgressSession({ catalog: discoveryCatalog() });
  const options = { search: 'making', filter: 'remaining' };
  session.setCompletion('making-it-yours', true);
  assert.equal(session.getView(options).pendingVariableChallengeId, 'making-it-yours');
  assert.equal(session.getView(options).parts[0].challenges[0].completed, false);
  session.submitVariableAward('making-it-yours', 237);
  assert.deepEqual(session.getView(options).parts, []);
  const completedView = session.getView({ search: 'making', filter: 'completed' });
  assert.equal(completedView.parts[0].challenges[0].selectedXpAward, 237);
  assert.equal(completedView.dashboard.totalXp, 237);
  assert.equal(completedView.dashboard.challengeCount, 6);
  session.setCompletion('making-it-yours', false);
  assert.equal(session.getView(options).parts[0].challenges[0].selectedXpAward, null);
  assert.equal(session.getView(options).dashboard.totalXp, 0);
});
