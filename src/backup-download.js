/** Download the in-memory session record without storage access or networking. */
export function downloadProgressBackup(session) {
  const backup = session.exportBackup();
  const blob = new Blob([backup.contents], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = backup.filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return backup.filename;
}

/** Download the exact unvalidated stored text through a distinct .txt file. */
export function downloadRecoveryData(session) {
  const recovery = session.exportRecoveryData();
  const blob = new Blob([recovery.contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = recovery.filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return recovery.filename;
}
