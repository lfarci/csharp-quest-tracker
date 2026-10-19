import { createProgressSession } from './progress-session.js';
import { createVariableRewardDialog } from './variable-reward-dialog.js';
import { createBrowserProgressSession } from './browser-progress.js';

const byId = id => document.getElementById(id);
const number = value => value.toLocaleString();
let session;
let variableRewardDialog;
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

function updatePartCompletion() {
  const { parts } = getSessionView();
  for (const part of parts) {
    const section = document.querySelector(`[data-book-part="${part.id}"]`);
    if (!section) continue;
    const completed = part.challenges.filter(challenge => challenge.completed).length;
    const total = part.challenges.length;
    const percentage = total ? Math.round(completed / total * 100) : 0;
    section.querySelector('.part-completion-count').textContent = `${completed} of ${total} completed`;
    const progress = section.querySelector('.part-completion-progress');
    progress.value = completed;
    progress.max = total || 1;
    progress.setAttribute('aria-label', `Part ${part.id} completion`);
    section.querySelector('.part-completion-percent').textContent = `${percentage}%`;
  }
}

function updateDisclosureControls() {
  const disclosures = [...document.querySelectorAll('.book-part:not([hidden]) .book-part-disclosure')];
  const toggleAll = byId('toggle-all-parts');
  const hasOpenPart = disclosures.some(disclosure => disclosure.open);

  toggleAll.textContent = hasOpenPart ? 'Close all parts' : 'Open all parts';
  toggleAll.disabled = disclosures.length === 0;
}

function updateChecklist() {
  const focused = document.activeElement;
  const previouslyVisible = [...document.querySelectorAll('.challenge:not([hidden]) input:not(:disabled)')];
  const focusedIndex = previouslyVisible.indexOf(focused);
  const filter = document.querySelector('input[name="completion-filter"]:checked').value;
  const { parts } = getSessionView({ search: byId('challenge-search').value, filter });
  updatePartCompletion();
  const visibleIds = new Set(parts.flatMap(part => part.challenges.map(challenge => challenge.id)));
  const discoveryIsActive = byId('challenge-search').value.trim() !== '' || filter !== 'all';
  for (const row of document.querySelectorAll('.challenge')) {
    row.hidden = !visibleIds.has(row.dataset.challengeId);
  }
  for (const section of document.querySelectorAll('.book-part')) {
    const visible = parts.some(part => part.id === Number(section.dataset.bookPart));
    section.hidden = !visible;
    if (visible && discoveryIsActive) section.querySelector('.book-part-disclosure').open = true;
  }
  const resultSummary = `${visibleIds.size} ${visibleIds.size === 1 ? 'Challenge' : 'Challenges'} shown`;
  byId('results-count').textContent = resultSummary;
  byId('no-results').hidden = visibleIds.size !== 0;
  updateDisclosureControls();
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
  const blocked = status.stale || status.recoveryNeeded;
  for (const checkbox of document.querySelectorAll('.challenge input[type="checkbox"]')) checkbox.disabled = blocked;
}

function renderChecklist() {
  for (const part of getSessionView().parts) {
    const section = document.createElement('section');
    section.className = 'book-part';
    section.dataset.bookPart = part.id;
    section.setAttribute('aria-labelledby', `part-title-${part.id}`);
    const disclosure = document.createElement('details');
    disclosure.className = 'book-part-disclosure';
    disclosure.open = true;
    const summary = document.createElement('summary');
    summary.id = `part-${part.id}`;
    const disclosureIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    disclosureIcon.setAttribute('class', 'part-disclosure-icon');
    disclosureIcon.setAttribute('aria-hidden', 'true');
    disclosureIcon.setAttribute('viewBox', '0 0 16 16');
    disclosureIcon.setAttribute('focusable', 'false');
    const disclosurePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    disclosurePath.setAttribute('d', 'M5.25 3.5 11 8l-5.75 4.5V3.5Z');
    disclosurePath.setAttribute('fill', 'currentColor');
    disclosureIcon.append(disclosurePath);
    const heading = document.createElement('h2');
    heading.id = `part-title-${part.id}`;
    heading.textContent = `Part ${part.id}: ${part.title}`;
    const completion = document.createElement('span');
    completion.className = 'part-completion';
    const count = document.createElement('span');
    count.className = 'part-completion-count';
    const percent = document.createElement('span');
    percent.className = 'part-completion-percent';
    const progress = document.createElement('progress');
    progress.className = 'part-completion-progress';
    progress.max = part.challenges.length || 1;
    completion.append(count, progress, percent);
    summary.append(disclosureIcon, heading, completion);
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
    disclosure.addEventListener('toggle', updateDisclosureControls);
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
    variableRewardDialog = createVariableRewardDialog({ session, onChange: syncChallenge });
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
    byId('toggle-all-parts').addEventListener('click', () => {
      const disclosures = [...document.querySelectorAll('.book-part:not([hidden]) .book-part-disclosure')];
      const shouldOpen = !disclosures.some(disclosure => disclosure.open);
      for (const disclosure of disclosures) disclosure.open = shouldOpen;
      updateDisclosureControls();
      byId('action-status').textContent = shouldOpen ? 'Visible Book parts expanded.' : 'Visible Book parts collapsed.';
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
