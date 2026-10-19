import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

const pageStyles = {
  'index.html': ['assets/css/base.css', 'assets/css/tracker.css'],
  'about.html': ['assets/css/base.css'],
  'settings.html': ['assets/css/base.css', 'assets/css/settings.css'],
};

async function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8');
}

function localReferences(html) {
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map(match => match[1]);

  return references.filter(reference =>
    !reference.startsWith('#') &&
    !/^[a-z][a-z\d+.-]*:/i.test(reference)
  );
}

for (const [page, expectedStyles] of Object.entries(pageStyles)) {
  test(`${page} loads only the relevant stylesheets`, async () => {
    const html = await readProjectFile(page);
    const actualStyles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]
      .map(match => match[1]);

    assert.deepEqual(actualStyles, expectedStyles);
  });

  test(`${page} references existing local pages and assets`, async () => {
    const html = await readProjectFile(page);

    for (const reference of localReferences(html)) {
      await assert.doesNotReject(
        readFile(new URL(reference, new URL(page, root))),
        `Missing local resource ${reference} from ${page}`
      );
    }
  });
}

test('manifest icons resolve to existing files', async () => {
  const manifest = JSON.parse(await readProjectFile('site.webmanifest'));

  for (const icon of manifest.icons) {
    await assert.doesNotReject(
      readFile(new URL(icon.src, new URL('site.webmanifest', root))),
      `Missing manifest icon ${icon.src}`
    );
  }
});
