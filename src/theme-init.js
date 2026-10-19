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
  // Private or restricted browsing may disable storage; use the system theme.
}
