import { downloadRecoveryData } from './backup-download.js';

/** Present raw-data download and the explicitly confirmed fresh-start recovery path. */
export function createRecoveryControls({ session, onRecovery }) {
  const section = document.getElementById('recovery-controls');
  const download = document.getElementById('download-recovery-data');
  const trigger = document.getElementById('start-fresh');
  const dialog = document.getElementById('fresh-start-dialog');
  const form = document.getElementById('fresh-start-form');
  const cancel = document.getElementById('cancel-fresh-start');
  const confirm = document.getElementById('confirm-fresh-start');
  const error = document.getElementById('fresh-start-error');
  const status = document.getElementById('recovery-status');
  let review;

  function update(availability) {
    const statusValue = typeof availability === 'boolean' ? { recoveryDataAvailable: availability } : availability;
    section.hidden = !statusValue.recoveryDataAvailable;
    if (!section.hidden) {
      const disclosure = section.closest('details');
      if (disclosure) disclosure.open = true;
    }
    trigger.disabled = statusValue.stale;
  }

  function close() {
    if (dialog.open) dialog.close();
    if (section.hidden) document.getElementById('import-progress-file').focus();
    else if (trigger.isConnected) trigger.focus();
  }

  function abandon() {
    if (review) session.cancelFreshStart(review);
    review = null;
    error.textContent = '';
    error.hidden = true;
    close();
  }

  download.addEventListener('click', () => {
    try {
      const filename = downloadRecoveryData(session);
      status.textContent = `Original recovery data downloaded: ${filename}`;
    } catch (cause) {
      status.textContent = cause.message;
    }
  });

  trigger.addEventListener('click', () => {
    try {
      review = session.previewFreshStart();
      error.textContent = '';
      error.hidden = true;
      dialog.showModal();
      cancel.focus();
    } catch (cause) {
      status.textContent = cause.message;
    }
  });

  dialog.addEventListener('cancel', event => { event.preventDefault(); abandon(); });
  cancel.addEventListener('click', abandon);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    confirm.disabled = true;
    try {
      await session.confirmFreshStart(review);
      review = null;
      close();
      onRecovery();
    } catch (cause) {
      error.textContent = cause.message;
      error.hidden = false;
      error.focus();
    } finally {
      confirm.disabled = false;
    }
  });

  return { update };
}
