/** Present the variable-award interaction; the progress session owns its state. */
export function createVariableRewardDialog({ session, onChange }) {
  const dialog = document.getElementById('variable-reward-dialog');
  const form = document.getElementById('variable-reward-form');
  const input = document.getElementById('variable-award');
  const error = document.getElementById('variable-award-error');
  let challengeId;
  let trigger;

  function clearError() {
    error.textContent = '';
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  }

  function finish() {
    dialog.close();
    if (trigger?.isConnected) trigger.focus();
  }

  function cancel() {
    session.cancelVariableAward();
    finish();
    onChange(challengeId, false);
  }

  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    cancel();
  });
  document.getElementById('cancel-variable-award').addEventListener('click', cancel);
  input.addEventListener('input', clearError);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      await session.submitVariableAward(challengeId, input.valueAsNumber);
      finish();
      onChange(challengeId, true);
    } catch (cause) {
      error.textContent = cause.message;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  });

  return {
    open(challenge, checkbox) {
      challengeId = challenge.id;
      trigger = checkbox;
      input.value = '';
      clearError();
      dialog.showModal();
      input.focus();
    },
  };
}
