import { createBrowserProgressSession } from './browser-progress.js';
import { downloadProgressBackup } from './backup-download.js';
import { createImportDialog } from './import-dialog.js';
import { createRecoveryControls } from './recovery-controls.js';

const byId = id => document.getElementById(id);
let session;
let recoveryControls;

function updateStatus() {
  if (!session) return;
  const status = session.getStatus();
  byId('save-status').textContent = status.message;
  byId('save-status').hidden = false;
  byId('export-progress').disabled = status.recoveryNeeded;
  byId('import-progress-file').disabled = status.stale;
  recoveryControls?.update(status);
}

async function start() {
  try {
    const response = await fetch(new URL('../data/catalog.json', import.meta.url));
    if (!response.ok) throw new Error('The catalog could not be downloaded.');
    const catalog = await response.json();
    let storage;
    let lockManager;
    try { storage = window.localStorage; } catch { storage = null; }
    try { lockManager = navigator.locks; } catch { lockManager = null; }
    session = await createBrowserProgressSession({ catalog, adapters: {
      storage,
      lockManager,
      onStorageChange: listener => {
        const handle = event => listener(event);
        window.addEventListener('storage', handle);
        return () => window.removeEventListener('storage', handle);
      },
      onStatusChange: updateStatus,
    } });
    byId('export-progress').addEventListener('click', () => {
      try {
        if (!session.getProgress()) throw new Error('Progress needs recovery first.');
        byId('backup-status').textContent = `Backup download started: ${downloadProgressBackup(session)}`;
      } catch {
        byId('backup-status').textContent = 'The backup could not be downloaded. Try exporting again.';
      }
    });
    createImportDialog({ session, onImport: updateStatus });
    recoveryControls = createRecoveryControls({ session, onRecovery: updateStatus });
    byId('loading').hidden = true;
    updateStatus();
  } catch (error) {
    byId('loading').hidden = true;
    byId('load-error').textContent = `Saved progress could not be checked. Reload the page to try again. ${error.message}`;
    byId('load-error').hidden = false;
  }
}

start();
