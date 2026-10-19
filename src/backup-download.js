/** Download the in-memory session record without storage access or networking. */
export function downloadProgressBackup(session) {
  const backup = session.exportBackup();
  if (!backup) throw new Error('Progress needs recovery before it can be exported.');
  return download(backup, 'text/csv;charset=utf-8');
}

/** Download the exact unvalidated stored text through a distinct .txt file. */
export function downloadRecoveryData(session) {
  return download(session.exportRecoveryData(), 'text/plain;charset=utf-8');
}

function download({ filename, contents }, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return filename;
}
