import { createBrowserProgressSession } from './browser-progress.js';

/** Load the catalog and connect a page-local session to browser capabilities. */
export async function loadBrowserProgressSession(onStatusChange) {
  const response = await fetch(new URL('../data/catalog.json', import.meta.url));
  if (!response.ok) throw new Error('The catalog could not be downloaded.');
  const catalog = await response.json();
  let storage;
  let lockManager;
  try { storage = window.localStorage; } catch { storage = null; }
  try { lockManager = navigator.locks; } catch { lockManager = null; }
  let warningActive = false;
  const warnBeforeLeaving = event => {
    event.preventDefault();
    event.returnValue = '';
  };
  const session = await createBrowserProgressSession({ catalog, adapters: {
    storage,
    lockManager,
    onStorageChange: listener => {
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    },
    onStatusChange: status => {
      if (status.hasUnsavedChanges !== warningActive) {
        warningActive = status.hasUnsavedChanges;
        if (warningActive) window.addEventListener('beforeunload', warnBeforeLeaving);
        else window.removeEventListener('beforeunload', warnBeforeLeaving);
      }
      onStatusChange?.(status);
    },
  } });
  return { catalog, session };
}
