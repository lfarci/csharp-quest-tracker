import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const themeScript = await readFile(
  new URL('../src/theme-init.js', import.meta.url),
  'utf8'
);

function runThemeInitializer(storage) {
  const documentElement = { dataset: {} };
  runInNewContext(themeScript, {
    localStorage: storage,
    document: { documentElement },
  });
  return documentElement.dataset.theme;
}

test('early theme initialization applies a supported preference', () => {
  assert.equal(runThemeInitializer({ getItem: () => 'dark' }), 'dark');
  assert.equal(runThemeInitializer({ getItem: () => 'light' }), 'light');
});

test('system or unknown preferences leave theme selection to CSS', () => {
  assert.equal(runThemeInitializer({ getItem: () => null }), undefined);
  assert.equal(runThemeInitializer({ getItem: () => 'other' }), undefined);
});

test('blocked storage leaves theme unset instead of crashing', () => {
  const deniedStorage = {
    getItem() {
      throw new Error('Storage access denied');
    },
  };

  assert.doesNotThrow(() => runThemeInitializer(deniedStorage));
  assert.equal(runThemeInitializer(deniedStorage), undefined);
});
