/** Validate the complete catalog before a progress session can be presented. */
// Validate at the boundary before any reader progress is interpreted.
export function validateCatalog(catalog) {
  const invalid = () => {
    throw new Error('The Challenge catalog is invalid. Please reload or try again later.');
  };
  if (!catalog || catalog.bookEdition !== 5 || typeof catalog.revision !== 'string' ||
      !catalog.revision || !Array.isArray(catalog.parts) || catalog.parts.length !== 5 ||
      !Array.isArray(catalog.challenges) || !catalog.challenges.length ||
      !Array.isArray(catalog.levelThresholds) || catalog.levelThresholds.length !== 10 ||
      catalog.levelThresholds[0] !== 0) invalid();
  catalog.levelThresholds.forEach((threshold, index) => {
    if (!Number.isSafeInteger(threshold) || (index && threshold <= catalog.levelThresholds[index - 1])) invalid();
  });
  const partIds = new Set();
  for (const part of catalog.parts) {
    if (!part || !Number.isSafeInteger(part.id) || partIds.has(part.id) ||
        typeof part.title !== 'string' || !part.title.trim()) invalid();
    partIds.add(part.id);
  }
  const ids = new Set();
  let previousPartIndex = -1;
  let variableCount = 0;
  catalog.challenges.forEach((challenge, index) => {
    if (!challenge || typeof challenge.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(challenge.id) ||
        ids.has(challenge.id) || typeof challenge.title !== 'string' || !challenge.title.trim() ||
        !Number.isSafeInteger(challenge.page) || challenge.page < 1 ||
        challenge.order !== index + 1 || !partIds.has(challenge.bookPart) || !challenge.reward) invalid();
    ids.add(challenge.id);
    const partIndex = catalog.parts.findIndex(part => part.id === challenge.bookPart);
    if (partIndex < previousPartIndex) invalid();
    previousPartIndex = partIndex;
    const reward = challenge.reward;
    if (reward.kind === 'fixed') {
      if (!Number.isSafeInteger(reward.xp) || reward.xp <= 0 || challenge.id === 'making-it-yours') invalid();
    } else if (reward.kind === 'variable') {
      variableCount++;
      if (challenge.id !== 'making-it-yours' || reward.notation !== '?' ||
          reward.minimum !== 50 || reward.maximum !== 400) invalid();
    } else invalid();
  });
  if (variableCount !== 1) invalid();
}
