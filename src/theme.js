/**
 * Theme selection is optional on each page. The inline HTML script applies
 * a saved theme early to prevent a flash before this module loads.
 */
const selector = document.querySelector('#theme-select');

function readTheme() {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return document.documentElement.dataset.theme || 'system';
  }
}

function applyTheme(theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try {
    if (theme === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', theme);
  } catch {}
}

if (selector) {
  selector.value = readTheme();
  selector.addEventListener('change', () => {
    applyTheme(selector.value);
    document.querySelector('#theme-status').textContent = `Color theme set to ${selector.options[selector.selectedIndex].text}.`;
  });
}
