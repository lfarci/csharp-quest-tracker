import { loadBrowserProgressSession } from './browser-session.js';
import { downloadProgressBackup } from './backup-download.js';
import { createImportDialog } from './import-dialog.js';
import { createRecoveryControls } from './recovery-controls.js';

/** Settings page wiring; persistence and import validation live in session modules. */
const byId = id => document.getElementById(id);
let session;
let recoveryControls;

function updateStatus() {
  if (!session) return;
  const status = session.getStatus();
  byId('save-status').textContent = status.message;
  byId('save-status').hidden = false;
  byId('save-status').classList.toggle('sr-only', status.saved);
  byId('export-progress').disabled = status.recoveryNeeded;
  byId('import-progress-file').disabled = status.stale;
  recoveryControls?.update(status);
}

// Initialize controls only after the persisted browser session is loaded.
async function start() {
  try {
    ({ session } = await loadBrowserProgressSession(updateStatus));
    byId('export-progress').addEventListener('click', () => {
      try {
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
