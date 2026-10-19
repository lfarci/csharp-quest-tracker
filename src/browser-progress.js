import { createProgressSession } from './progress-session.js';
import { decodeProgressCsv } from './progress-backup-csv.js';

export const PROGRESS_STORAGE_KEY = 'csharp-quest-tracker:progress:v1';
export const PROGRESS_LOCK_NAME = 'csharp-quest-tracker:progress';

class StaleProgressError extends Error {
  constructor() { super('Progress changed in another tab. Reload this page before editing again.'); }
}

function emptyProgress(catalog) {
  return { schemaVersion: 1, bookEdition: catalog.bookEdition, catalogRevision: catalog.revision,
    completedChallengeIds: [], variableXpAwards: {} };
}

function decodeStored(raw, catalog) {
  const stored = JSON.parse(raw);
  const keys = ['schemaVersion', 'bookEdition', 'catalogRevision', 'completedChallengeIds', 'variableXpAwards', 'internalWriteId'];
  if (!stored || typeof stored !== 'object' || Array.isArray(stored) ||
      Object.keys(stored).some(key => !keys.includes(key)) || keys.some(key => !(key in stored)) ||
      stored.schemaVersion !== 1 || stored.bookEdition !== catalog.bookEdition || stored.catalogRevision !== catalog.revision ||
      !Array.isArray(stored.completedChallengeIds) || stored.completedChallengeIds.some(id => typeof id !== 'string') ||
      typeof stored.internalWriteId !== 'string' || stored.internalWriteId.length === 0) {
    throw new Error('Stored progress uses an invalid or unsupported format.');
  }
  return createProgressSession({ catalog, progress: {
    completedChallengeIds: stored.completedChallengeIds, variableXpAwards: stored.variableXpAwards,
  } });
}

function defaultIdentity() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseBackup(contents, catalog) {
  if (contents.trimStart().startsWith('{')) {
    throw new Error('Import CSV backups only. JSON files are not supported. Your progress was not changed.');
  }
  const value = decodeProgressCsv(contents, catalog);
  try {
    return createProgressSession({ catalog, progress: {
      completedChallengeIds: value.completedChallengeIds,
      variableXpAwards: value.variableXpAwards,
    } });
  } catch (error) {
    throw new Error(`This backup contains unsupported progress: ${error.message} Your progress was not changed.`);
  }
}

/** Browser persistence seam. The session remains the sole owner of XP calculations. */
export async function createBrowserProgressSession({ catalog, adapters = {} }) {
  const storage = adapters.storage;
  const lockManager = adapters.lockManager;
  const identify = adapters.createIdentity ?? defaultIdentity;
  let session;
  let acceptedProgress;
  let acceptedRaw = null;
  let recoveryRaw = null;
  let stale = false;
  let recoveryNeeded = false;
  let statisticsUnavailable = false;
  let saved = Boolean(lockManager?.request && storage);
  let message = saved ? 'Your progress stays on this device. To use it on another device, download a backup file here, then import it there.' : "Your progress isn't saved. This browser can't safely save changes across tabs. Download a backup to keep your latest progress.";
  let queue = Promise.resolve();
  let generation = 0;
  const previewStates = new WeakMap();

  const emitStatus = () => adapters.onStatusChange?.(getStatus());
  adapters.onStorageChange?.(event => {
    if (event.key !== PROGRESS_STORAGE_KEY && event.key !== null) return;
    if (event.key === null || event.newValue !== acceptedRaw) {
      stale = true;
      saved = false;
      message = 'Progress changed in another tab. Reload this page before editing again.';
      emitStatus();
    }
  });

  if (!storage) {
    session = createProgressSession({ catalog });
    statisticsUnavailable = true;
    saved = false;
    message = "Progress isn't saved because browser storage is unavailable. Your changes remain in this tab; export a backup.";
  } else {
    try {
      acceptedRaw = storage.getItem(PROGRESS_STORAGE_KEY);
      if (acceptedRaw === null) session = createProgressSession({ catalog, progress: emptyProgress(catalog) });
      else {
        try { session = decodeStored(acceptedRaw, catalog); }
        catch {
          recoveryNeeded = true;
          recoveryRaw = acceptedRaw;
          saved = false;
          message = 'Saved progress needs recovery. Statistics are unavailable and stored data is preserved.';
        }
      }
    } catch {
      session = createProgressSession({ catalog });
      statisticsUnavailable = true;
      saved = false;
      message = "Progress isn't saved because browser storage can't be read. Your changes remain in this tab; export a backup.";
    }
  }

  function hasUnsavedChanges() {
    const progress = session?.getProgress();
    if (!progress) return false;
    if (!acceptedProgress) return true;
    return progress.completedChallengeIds.length !== acceptedProgress.completedChallengeIds.length ||
      progress.completedChallengeIds.some(id => !acceptedProgress.completedChallengeIds.includes(id) ||
        progress.variableXpAwards[id] !== acceptedProgress.variableXpAwards[id]);
  }
  function getStatus() {
    return { saved, stale, recoveryNeeded, recoveryDataAvailable: recoveryRaw !== null,
      hasUnsavedChanges: hasUnsavedChanges(), message };
  }
  function getProgress() { return session?.getProgress() ?? null; }
  function getView(options) {
    const view = session?.getView(options);
    if (!view) return null;
    // Unreadable saved progress must not hide usable in-memory interactions.
    return statisticsUnavailable ? { ...view, dashboard: null } : view;
  }

  function perform(method, args, { allowRecovery = false } = {}) {
    const operation = async () => {
      const apply = () => {
        const result = typeof method === 'function'
        ? method({
          replaceProgress: progress => {
            const replacement = createProgressSession({ catalog, progress });
            // A confirmed replacement cannot rely on an unreadable, synthetic baseline.
            if (statisticsUnavailable) acceptedProgress = null;
            session = replacement;
            statisticsUnavailable = false;
          } })
        : session[method](...args);
        generation++;
        return result;
      };
      if (stale) throw new StaleProgressError();
      if (recoveryNeeded && !allowRecovery) throw new Error('Saved progress needs recovery before it can be edited.');
      if (!lockManager?.request || !storage) {
        apply();
        saved = false;
        recoveryNeeded = false;
        message = "Progress isn't saved. Your changes remain in this tab; export a backup to keep your latest progress.";
        if (recoveryRaw !== null) message += ' Original saved data remains available as recovery data.';
        emitStatus();
        return;
      }

      let entered = false;
      let reading = false;
      let changedInMemory = false;
      let wroteSuccessfully = false;
      try {
        await lockManager.request(PROGRESS_LOCK_NAME, async () => {
          entered = true;
          reading = true;
          const current = storage.getItem(PROGRESS_STORAGE_KEY);
          reading = false;
          if (current !== acceptedRaw) {
            stale = true;
            saved = false;
            message = 'Progress changed in another tab. Reload this page before editing again.';
            emitStatus();
            throw new StaleProgressError();
          }
          apply();
          changedInMemory = true;
          const record = { ...session.getProgress(), internalWriteId: identify() };
          const encoded = JSON.stringify(record);
          storage.setItem(PROGRESS_STORAGE_KEY, encoded);
          wroteSuccessfully = true;
          acceptedRaw = encoded;
          acceptedProgress = session.getProgress();
          statisticsUnavailable = false;
          recoveryRaw = null;
          saved = true;
          recoveryNeeded = false;
          message = 'Your progress stays on this device. To use it on another device, download a backup file here, then import it there.';
          emitStatus();
        });
      } catch (error) {
        if (error instanceof StaleProgressError) throw error;
        if (wroteSuccessfully) return;
        if (entered && !changedInMemory && !reading) throw error;
        if (entered && reading) {
          apply();
          saved = false;
          recoveryNeeded = false;
          message = "Progress isn't saved because browser storage can't be read. Your changes remain in this tab; export a backup.";
          if (recoveryRaw !== null) message += ' Original saved data remains available as recovery data.';
          emitStatus();
          return;
        }
        if (entered && changedInMemory) {
          saved = false;
          recoveryNeeded = false;
          message = "Progress isn't saved because the latest change couldn't be written. Your changes remain in this tab; export a backup.";
          if (recoveryRaw !== null) message += ' Original saved data remains available as recovery data.';
          emitStatus();
          return;
        }
        // Lock acquisition failed before entering the protected section. Keep this change only in memory.
        apply();
        saved = false;
        recoveryNeeded = false;
        message = "Progress isn't saved because this browser couldn't acquire a safe save lock. Your changes remain in this tab; export a backup.";
        if (recoveryRaw !== null) message += ' Original saved data remains available as recovery data.';
        emitStatus();
      }
    };
    const result = queue.then(operation, operation);
    queue = result.catch(() => {});
    return result;
  }

  if (!session && !recoveryNeeded) session = createProgressSession({ catalog });
  acceptedProgress = session?.getProgress() ?? null;
  emitStatus();
  return {
    getStatus, getProgress, getView,
    setCompletion: (id, value) => perform('setCompletion', [id, value]),
    submitVariableAward: (id, award) => perform('submitVariableAward', [id, award]),
    previewImport(contents) {
      const incomingSession = parseBackup(contents, catalog);
      const summarize = view => view?.dashboard ? {
        completedCount: view.dashboard.completedCount,
        totalXp: view.dashboard.totalXp,
        characterLevel: view.dashboard.characterLevel,
      } : null;
      const preview = Object.freeze({
        current: summarize(getView()), incoming: summarize(incomingSession.getView()),
        replaces: true, bookEdition: catalog.bookEdition, catalogRevision: catalog.revision,
      });
      previewStates.set(preview, { generation, acceptedRaw, progress: incomingSession.getProgress() });
      return preview;
    },
    cancelImport(preview) { previewStates.delete(preview); },
    async confirmImport(preview) {
      const details = previewStates.get(preview);
      if (!details) throw new Error('This import review has expired or was canceled. Choose the file and review it again.');
      await perform(({ replaceProgress }) => {
        if (generation !== details.generation || acceptedRaw !== details.acceptedRaw) {
          throw new Error('Progress changed after this review. Review the backup again before replacing progress.');
        }
        replaceProgress(details.progress);
      }, [], { allowRecovery: true });
      previewStates.delete(preview);
    },
    exportRecoveryData() {
      if (recoveryRaw === null) throw new Error('There is no original recovery data available to download.');
      const exportedAt = new Date().toISOString();
      return {
        filename: `csharp-quest-tracker-recovery-data-${exportedAt.replace(/[:.]/g, '-')}.txt`,
        contents: recoveryRaw,
      };
    },
    previewFreshStart() {
      if (recoveryRaw === null) throw new Error('Fresh start is only available while saved progress needs recovery.');
      const preview = Object.freeze({ recoveryDataAvailable: true });
      previewStates.set(preview, { generation, acceptedRaw, freshStart: true });
      return preview;
    },
    cancelFreshStart(preview) { previewStates.delete(preview); },
    async confirmFreshStart(preview) {
      const details = previewStates.get(preview);
      if (!details?.freshStart) throw new Error('This fresh-start review has expired or was canceled. Review it again.');
      await perform(({ replaceProgress }) => {
        if (generation !== details.generation || acceptedRaw !== details.acceptedRaw) {
          throw new Error('Saved progress changed after this review. Review recovery again before starting fresh.');
        }
        replaceProgress(emptyProgress(catalog));
      }, [], { allowRecovery: true });
      previewStates.delete(preview);
    },
    cancelVariableAward: () => session?.cancelVariableAward(),
    exportBackup: () => session?.exportBackup() ?? null,
  };
}
