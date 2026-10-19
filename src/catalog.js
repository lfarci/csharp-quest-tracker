/** Validate the official catalog before interpreting any saved reader progress. */

const VALID_CHALLENGE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function invalidCatalog() {
  throw new Error('The Challenge catalog is invalid. Please reload or try again later.');
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasValidShape(catalog) {
  if (!catalog || catalog.bookEdition !== 5 || !isNonEmptyText(catalog.revision)) {
    return false;
  }

  if (!Array.isArray(catalog.parts) || catalog.parts.length !== 5) {
    return false;
  }

  if (!Array.isArray(catalog.challenges) || catalog.challenges.length === 0) {
    return false;
  }

  return Array.isArray(catalog.levelThresholds) &&
    catalog.levelThresholds.length === 10 &&
    catalog.levelThresholds[0] === 0;
}

function hasValidThresholds(thresholds) {
  for (let index = 0; index < thresholds.length; index++) {
    const threshold = thresholds[index];

    if (!Number.isSafeInteger(threshold)) return false;
    if (index > 0 && threshold <= thresholds[index - 1]) return false;
  }

  return true;
}

function isValidPart(part, seenIds) {
  return part !== null &&
    typeof part === 'object' &&
    Number.isSafeInteger(part.id) &&
    !seenIds.has(part.id) &&
    isNonEmptyText(part.title);
}

function isValidChallenge(challenge, index, partIds, seenIds) {
  if (!challenge || typeof challenge !== 'object') return false;

  return typeof challenge.id === 'string' &&
    VALID_CHALLENGE_ID.test(challenge.id) &&
    !seenIds.has(challenge.id) &&
    isNonEmptyText(challenge.title) &&
    Number.isSafeInteger(challenge.page) &&
    challenge.page > 0 &&
    challenge.order === index + 1 &&
    partIds.has(challenge.bookPart) &&
    challenge.reward !== null &&
    typeof challenge.reward === 'object';
}

function isValidReward(challenge) {
  const { reward } = challenge;

  if (reward.kind === 'fixed') {
    return Number.isSafeInteger(reward.xp) &&
      reward.xp > 0 &&
      challenge.id !== 'making-it-yours';
  }

  if (reward.kind === 'variable') {
    return challenge.id === 'making-it-yours' &&
      reward.notation === '?' &&
      reward.minimum === 50 &&
      reward.maximum === 400;
  }

  return false;
}

/**
 * Keep validation strict, but separate independent rules into focused
 * predicates so errors never leave a partially trusted catalog behind.
 */
export function validateCatalog(catalog) {
  if (!hasValidShape(catalog)) invalidCatalog();
  if (!hasValidThresholds(catalog.levelThresholds)) invalidCatalog();

  const partIds = new Set();
  for (const part of catalog.parts) {
    if (!isValidPart(part, partIds)) invalidCatalog();
    partIds.add(part.id);
  }

  const seenChallengeIds = new Set();
  let previousPartIndex = -1;
  let variableRewardCount = 0;

  for (const [index, challenge] of catalog.challenges.entries()) {
    if (!isValidChallenge(challenge, index, partIds, seenChallengeIds)) invalidCatalog();
    if (!isValidReward(challenge)) invalidCatalog();

    const partIndex = catalog.parts.findIndex(part => part.id === challenge.bookPart);
    if (partIndex < previousPartIndex) invalidCatalog();

    previousPartIndex = partIndex;
    seenChallengeIds.add(challenge.id);

    if (challenge.reward.kind === 'variable') variableRewardCount++;
  }

  if (variableRewardCount !== 1) invalidCatalog();
}
