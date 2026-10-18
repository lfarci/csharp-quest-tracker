import { createProgressSession } from './progress-session.js';
import { createVariableRewardDialog } from './variable-reward-dialog.js';
import { downloadProgressBackup } from './backup-download.js';
import { createBrowserProgressSession } from './browser-progress.js';
import { createImportDialog } from './import-dialog.js';
import { createRecoveryControls } from './recovery-controls.js';

const byId = id => document.getElementById(id);
const number = value => value.toLocaleString();
let session;
let variableRewardDialog;
let recoveryControls;
let catalogForUi;

function getSessionView(options) {
  return session?.getView(options) ?? createProgressSession({ catalog: catalogForUi }).getView(options);
}

function updateDashboard() {
  const view = session?.getView();
  if (!view) {
    for (const id of ['character-level', 'total-xp', 'completed-count', 'tracker-completion', 'next-level']) byId(id).textContent = 'Unavailable';
    byId('level-progress').value = 0;
    byId('level-progress-label').textContent = 'Statistics unavailable until progress is recovered';
    return;
  }
  const { dashboard } = view;
  byId('character-level').textContent = dashboard.characterLevel;
  byId('total-xp').textContent = number(dashboard.totalXp);
  byId('completed-count').textContent = `${dashboard.completedCount} / ${dashboard.challengeCount}`;
  byId('tracker-completion').textContent = `${Math.round(dashboard.trackerCompletion * 100)}%`;
  byId('level-progress').value = dashboard.levelProgress;
  byId('level-progress-label').textContent = dashboard.maximumLevel
    ? 'Maximum Character level reached'
    : `Progress to Character level ${dashboard.characterLevel + 1}`;
  byId('next-level').textContent = dashboard.maximumLevel
    ? 'Maximum level'
    : `${number(dashboard.xpRemaining)} XP to Character level ${dashboard.characterLevel + 1}`;
}

function updateChecklist() {
  const focused = document.activeElement;
  const previouslyVisible = [...document.querySelectorAll('.challenge:not([hidden]) input:not(:disabled)')];
  const focusedIndex = previouslyVisible.indexOf(focused);
  const filter = document.querySelector('input[name="completion-filter"]:checked').value;
  const { parts } = getSessionView({ search: byId('challenge-search').value, filter });
  const visibleIds = new Set(parts.flatMap(part => part.challenges.map(challenge => challenge.id)));
  const discoveryIsActive = byId('challenge-search').value.trim() !== '' || filter !== 'all';
  for (const row of document.querySelectorAll('.challenge')) {
    row.hidden = !visibleIds.has(row.dataset.challengeId);
  }
  for (const section of document.querySelectorAll('.book-part')) {
    const visible = parts.some(part => part.id === Number(section.dataset.bookPart));
    section.hidden = !visible;
    if (visible && discoveryIsActive) section.querySelector('.book-part-disclosure').open = true;
    byId(`part-link-${section.dataset.bookPart}`).hidden = !visible;
  }
  const resultSummary = `${visibleIds.size} ${visibleIds.size === 1 ? 'Challenge' : 'Challenges'} shown`;
  byId('results-count').textContent = resultSummary;
  byId('no-results').hidden = visibleIds.size !== 0;
  byId('part-navigation').hidden = visibleIds.size === 0;
  if (focusedIndex !== -1 && focused.closest('.challenge').hidden) {
    const next = previouslyVisible.slice(focusedIndex + 1).find(input => !input.closest('.challenge').hidden);
    const previous = previouslyVisible.slice(0, focusedIndex).reverse().find(input => !input.closest('.challenge').hidden);
    (next ?? previous ?? byId('challenge-search')).focus();
  }
  return resultSummary;
}

function syncChallenge(id, announce = true) {
  const challenge = getSessionView().parts.flatMap(part => part.challenges).find(challenge => challenge.id === id);
  if (!challenge) return;
  const item = document.querySelector(`[data-challenge-id="${id}"]`);
  item.querySelector('input').checked = challenge.completed;
  item.classList.toggle('is-complete', challenge.completed);
  if (challenge.reward.kind === 'variable') {
    item.querySelector('.challenge-reward').textContent = `${challenge.selectedXpAward ?? '?'} XP`;
  }
  updateDashboard();
  updateSaveStatus();
  const resultSummary = updateChecklist();
  if (announce && session.getView()) {
    const { dashboard } = session.getView();
    byId('action-status').textContent = `${challenge.title} ${challenge.completed ? 'completed' : 'marked remaining'}. ${number(dashboard.totalXp)} XP. Character level ${dashboard.characterLevel}. ${resultSummary}.`;
  } else if (announce) {
    byId('action-status').textContent = `${challenge.title} ${challenge.completed ? 'completed' : 'marked remaining'} in this session. Saved progress statistics are unavailable.`;
  }
}

function updateSaveStatus() {
  if (!session) return;
  const status = session.getStatus();
  byId('save-status').textContent = status.message;
  const blocked = status.stale || status.recoveryNeeded;
  for (const checkbox of document.querySelectorAll('.challenge input[type="checkbox"]')) checkbox.disabled = blocked;
  byId('import-progress-file').disabled = status.stale;
  byId('export-progress').disabled = status.recoveryNeeded;
  recoveryControls?.update(status);
}

function updateAllChallengeRows() {
  const challenges = new Map(getSessionView().parts.flatMap(part => part.challenges).map(challenge => [challenge.id, challenge]));
  for (const [id, challenge] of challenges) {
    const item = document.querySelector(`[data-challenge-id="${id}"]`);
    const checkbox = item.querySelector('input');
    checkbox.checked = challenge.completed;
    item.classList.toggle('is-complete', challenge.completed);
    if (challenge.reward.kind === 'variable') item.querySelector('.challenge-reward').textContent = `${challenge.selectedXpAward ?? '?'} XP`;
  }
  updateDashboard();
  updateSaveStatus();
  updateChecklist();
}

function updateAfterImport() {
  updateAllChallengeRows();
  byId('action-status').textContent = 'Backup progress replaced the current progress.';
}

function updateAfterFreshStart() {
  updateAllChallengeRows();
  byId('action-status').textContent = 'Fresh start confirmed. Progress is empty with 0 XP and Character level 1.';
}

function renderChecklist() {
  for (const part of getSessionView().parts) {
    const anchor = document.createElement('a');
    anchor.id = `part-link-${part.id}`;
    anchor.href = `#part-${part.id}`;
    anchor.textContent = `Part ${part.id}`;
    anchor.addEventListener('click', () => {
      byId(`part-${part.id}`).closest('.book-part-disclosure').open = true;
    });
    byId('part-navigation').append(anchor);

    const section = document.createElement('section');
    section.className = 'book-part';
    section.dataset.bookPart = part.id;
    section.setAttribute('aria-labelledby', `part-title-${part.id}`);
    const disclosure = document.createElement('details');
    disclosure.className = 'book-part-disclosure';
    disclosure.open = true;
    const summary = document.createElement('summary');
    summary.id = `part-${part.id}`;
    const heading = document.createElement('h2');
    heading.id = `part-title-${part.id}`;
    heading.textContent = `Part ${part.id}: ${part.title}`;
    summary.append(heading);
    const list = document.createElement('ul');
    list.className = 'challenge-list';
    for (const challenge of part.challenges) {
      const item = document.createElement('li');
      item.className = 'challenge';
      item.dataset.challengeId = challenge.id;
      const label = document.createElement('label');
      label.className = 'challenge-label';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `challenge-${challenge.id}`;
      checkbox.checked = challenge.completed;
      const title = document.createElement('span');
      title.className = 'challenge-title';
      title.textContent = challenge.title;
      const page = document.createElement('span');
      page.className = 'challenge-page';
      page.textContent = `Page ${challenge.page}`;
      const reward = document.createElement('span');
      reward.className = 'challenge-reward';
      reward.textContent = `${challenge.reward.kind === 'fixed' ? challenge.reward.xp : (challenge.selectedXpAward ?? '?')} XP`;
      label.append(checkbox, title, page, reward);
      item.append(label);
      if (challenge.reward.kind === 'variable') {
        const note = document.createElement('p');
        note.id = `note-${challenge.id}`;
        note.className = 'challenge-note';
        note.textContent = 'The official ? reward means 50–400 XP. Choose a whole-number award when completing this Challenge.';
        checkbox.setAttribute('aria-describedby', note.id);
        item.append(note);
      }
      checkbox.addEventListener('change', async () => {
        try {
          await session.setCompletion(challenge.id, checkbox.checked);
          if (getSessionView().pendingVariableChallengeId === challenge.id) {
            checkbox.checked = false;
            variableRewardDialog.open(challenge, checkbox);
            return;
          }
          syncChallenge(challenge.id);
        } catch (error) {
          const current = getSessionView().parts.flatMap(part => part.challenges).find(item => item.id === challenge.id);
          checkbox.checked = current?.completed ?? false;
          updateSaveStatus();
          byId('action-status').textContent = error.message;
        }
      });
      list.append(item);
    }
    disclosure.append(summary, list);
    section.append(disclosure);
    byId('challenges').append(section);
  }
}

async function start() {
  try {
    const response = await fetch(new URL('../data/catalog.json', import.meta.url));
    if (!response.ok) throw new Error('The catalog could not be downloaded.');
    catalogForUi = await response.json();
    let storage;
    let lockManager;
    try { storage = window.localStorage; } catch { storage = null; }
    try { lockManager = navigator.locks; } catch { lockManager = null; }
    session = await createBrowserProgressSession({ catalog: catalogForUi, adapters: {
      storage,
      lockManager,
      onStorageChange: listener => {
        const handle = event => listener(event);
        window.addEventListener('storage', handle);
        return () => window.removeEventListener('storage', handle);
      },
      onStatusChange: () => updateSaveStatus(),
    } });
    byId('export-progress').addEventListener('click', () => {
      try {
        if (!session.getProgress()) throw new Error('Progress needs recovery first.');
        const filename = downloadProgressBackup(session);
        byId('backup-status').textContent = `Backup download started: ${filename}`;
      } catch {
        byId('backup-status').textContent = 'The backup could not be downloaded. Try exporting again.';
      }
    });
    variableRewardDialog = createVariableRewardDialog({ session, onChange: syncChallenge });
    createImportDialog({ session, onImport: updateAfterImport });
    recoveryControls = createRecoveryControls({ session, onRecovery: updateAfterFreshStart });
    renderChecklist();
    updateSaveStatus();
    updateDashboard();
    updateChecklist();
    byId('discovery-controls').addEventListener('submit', event => event.preventDefault());
    const updateDiscovery = () => { byId('action-status').textContent = `${updateChecklist()}.`; };
    byId('challenge-search').addEventListener('input', updateDiscovery);
    for (const radio of document.querySelectorAll('input[name="completion-filter"]')) {
      radio.addEventListener('change', updateDiscovery);
    }
    byId('reset-view').addEventListener('click', () => {
      byId('challenge-search').value = '';
      document.querySelector('input[name="completion-filter"][value="all"]').checked = true;
      updateDiscovery();
      byId('challenge-search').focus();
    });
    byId('loading').hidden = true;
    byId('tracker').hidden = false;
  } catch (error) {
    byId('loading').hidden = true;
    byId('load-error').textContent = `The Challenge catalog could not be loaded. Reload the page to try again. ${error.message}`;
    byId('load-error').hidden = false;
  }
}

start();
