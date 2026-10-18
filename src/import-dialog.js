/** File selection, review, and confirmation UI for a validated replacement import. */
export function createImportDialog({ session, onImport }) {
  const picker = document.getElementById('import-progress-file');
  const dialog = document.getElementById('import-preview-dialog');
  const summary = document.getElementById('import-preview-summary');
  const error = document.getElementById('import-error');
  const form = document.getElementById('import-preview-form');
  const cancel = document.getElementById('cancel-import');
  const confirm = document.getElementById('confirm-import');
  let preview;
  let trigger;

  const number = value => value.toLocaleString();
  function showSummary(target, values) {
    for (const key of ['completedCount', 'totalXp', 'characterLevel']) {
      target.querySelector(`[data-summary="${key}"]`).textContent = values ? number(values[key]) : 'Unavailable';
    }
  }

  function close() {
    if (dialog.open) dialog.close();
    if (trigger?.isConnected) trigger.focus();
  }

  function abandon() {
    if (preview) session.cancelImport(preview);
    preview = null;
    picker.value = '';
    error.textContent = '';
    error.hidden = true;
    close();
  }

  picker.addEventListener('change', async () => {
    const file = picker.files?.[0];
    if (!file) return;
    trigger = picker;
    try {
      preview = session.previewImport(await file.text());
      showSummary(document.getElementById('current-import-summary'), preview.current);
      showSummary(document.getElementById('incoming-import-summary'), preview.incoming);
      document.getElementById('import-catalog-note').textContent =
        `Book edition ${preview.bookEdition}, catalog revision ${preview.catalogRevision}. No catalog migration is required.`;
      error.textContent = '';
      error.hidden = true;
      dialog.showModal();
      cancel.focus();
    } catch (cause) {
      document.getElementById('backup-status').textContent = cause.message;
      picker.value = '';
      picker.focus();
    }
  });

  dialog.addEventListener('cancel', event => { event.preventDefault(); abandon(); });
  cancel.addEventListener('click', abandon);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    confirm.disabled = true;
    try {
      await session.confirmImport(preview);
      preview = null;
      picker.value = '';
      close();
      onImport();
    } catch (cause) {
      error.textContent = cause.message;
      error.hidden = false;
      error.focus?.();
    } finally {
      confirm.disabled = false;
    }
  });
  return { focus: () => picker.focus() };
}
