/**
 * Load the saved theme synchronously before the page renders.
 * This small classic script is shared by all three HTML pages.
 */
try {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch {
  // Intentionally leave data-theme unset. The stylesheet's
  // prefers-color-scheme rules then provide the system theme automatically.
  // There is no saved preference to restore or write.
}
