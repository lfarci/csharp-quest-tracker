import { validateCatalog } from './catalog.js';
import { encodeProgressCsv } from './progress-backup-csv.js';

/** The domain boundary. Dashboard values are always derived from source progress. */
export function createProgressSession({ catalog, progress = {} }) {
  validateCatalog(catalog);
  catalog = structuredClone(catalog);
  // Completion and variable awards are the only mutable domain state.
  const completed = new Set(progress.completedChallengeIds ?? []);
  if (progress.variableXpAwards !== undefined &&
      (!progress.variableXpAwards || typeof progress.variableXpAwards !== 'object' || Array.isArray(progress.variableXpAwards))) {
    throw new Error('Variable XP awards must be an award record.');
  }
  const variableXpAwards = { ...progress.variableXpAwards };
  let pendingVariableChallengeId = null;
  function requireChallenge(id) {
    const challenge = catalog.challenges.find(challenge => challenge.id === id);
    if (!challenge) throw new Error(`Unknown Challenge: ${id}`);
    return challenge;
  }
  function validateAward(challenge, award) {
    if (!Number.isInteger(award) || award < challenge.reward.minimum || award > challenge.reward.maximum) {
      throw new Error('Choose a whole number from 50 through 400 XP.');
    }
  }
  for (const id of completed) {
    const challenge = requireChallenge(id);
    if (challenge.reward.kind === 'variable') validateAward(challenge, variableXpAwards[id]);
  }
  for (const id of Object.keys(variableXpAwards)) {
    const challenge = requireChallenge(id);
    if (!completed.has(id) || challenge.reward.kind !== 'variable') {
      throw new Error('An XP award must belong to a completed variable-reward Challenge.');
    }
  }
  return {
    getProgress() {
      return {
        schemaVersion: 1,
        bookEdition: catalog.bookEdition,
        catalogRevision: catalog.revision,
        completedChallengeIds: [...completed],
        variableXpAwards: { ...variableXpAwards },
      };
    },
    exportBackup() {
      const exportedAt = new Date().toISOString();
      return {
        filename: `csharp-quest-tracker-${catalog.bookEdition}e-progress-${exportedAt.replace(/[:.]/g, '-')}.csv`,
        contents: encodeProgressCsv({ catalog, progress: { completedChallengeIds: [...completed], variableXpAwards: { ...variableXpAwards } }, exportedAt }),
      };
    },
    submitVariableAward(id, award) {
      const challenge = requireChallenge(id);
      if (challenge.reward.kind !== 'variable' || pendingVariableChallengeId !== id) {
        throw new Error('Choose the variable-reward Challenge before submitting an award.');
      }
      validateAward(challenge, award);
      variableXpAwards[id] = award;
      completed.add(id);
      pendingVariableChallengeId = null;
    },
    cancelVariableAward() {
      pendingVariableChallengeId = null;
    },
    setCompletion(id, value) {
      const challenge = requireChallenge(id);
      if (typeof value !== 'boolean') throw new Error('Completion must be a boolean.');
      if (challenge.reward.kind === 'variable' && value && !completed.has(id)) {
        pendingVariableChallengeId = id;
        return;
      }
      if (value) completed.add(id);
      else {
        completed.delete(id);
        delete variableXpAwards[id];
        if (pendingVariableChallengeId === id) pendingVariableChallengeId = null;
      }
    },
    /**
     * Build a new view from current progress. Filters affect visible challenges,
     * not the XP totals or the completion percentage.
     */
    getView({ search = '', filter = 'all' } = {}) {
      const titleSearch = search.trim().toLowerCase();
      const totalXp = catalog.challenges.reduce((sum, challenge) => {
        if (!completed.has(challenge.id)) return sum;
        const reward = challenge.reward.kind === 'fixed'
          ? challenge.reward.xp
          : variableXpAwards[challenge.id];
        return sum + reward;
      }, 0);
      // Thresholds are sorted, so the first threshold above XP ends the search.
      let levelIndex = 0;
      for (let index = 1; index < catalog.levelThresholds.length; index++) {
        if (totalXp < catalog.levelThresholds[index]) break;
        levelIndex = index;
      }
      const currentThreshold = catalog.levelThresholds[levelIndex];
      const nextThreshold = catalog.levelThresholds[levelIndex + 1];
      return {
        pendingVariableChallengeId,
        dashboard: {
          totalXp, characterLevel: levelIndex + 1, completedCount: completed.size,
          challengeCount: catalog.challenges.length,
          trackerCompletion: completed.size / catalog.challenges.length,
          xpRemaining: nextThreshold === undefined ? null : nextThreshold - totalXp,
          levelProgress: nextThreshold === undefined ? 1 :
            (totalXp - currentThreshold) / (nextThreshold - currentThreshold),
          maximumLevel: nextThreshold === undefined,
        },
        parts: catalog.parts.map(part => ({ ...part, challenges: catalog.challenges
          .filter(challenge => challenge.bookPart === part.id &&
            challenge.title.toLowerCase().includes(titleSearch) &&
            (filter === 'all' || completed.has(challenge.id) === (filter === 'completed')))
          .map(challenge => ({ ...challenge, reward: { ...challenge.reward }, completed: completed.has(challenge.id), selectedXpAward: variableXpAwards[challenge.id] ?? null })) }))
          .filter(part => part.challenges.length > 0),
      };
    },
  };
}
