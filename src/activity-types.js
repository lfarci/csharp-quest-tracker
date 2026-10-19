/**
 * Supplemental visual distinctions supplied by the project owner.
 * Keep separate from the immutable catalog revision: these are display
 * labels only and must never affect progress, XP, or CSV compatibility.
 */
const BOSS_BATTLE_IDS = new Set([
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

export const activityTypes = {
  challenge: 'Challenge',
  'boss-battle': 'Boss Battle',
  'knowledge-check': 'Knowledge Check',
};

export function getActivityType(challenge) {
  if (BOSS_BATTLE_IDS.has(challenge.id)) return 'boss-battle';
  if (challenge.title.startsWith('Knowledge Check - ')) return 'knowledge-check';
  return 'challenge';
}

export function getBossBattleIds() {
  return new Set(BOSS_BATTLE_IDS);
}
