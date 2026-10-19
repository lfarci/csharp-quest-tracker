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

const canonicalUrls = {
  'index.html': 'https://lfarci.github.io/csharp-quest-tracker/',
  'about.html': 'https://lfarci.github.io/csharp-quest-tracker/about.html',
  'settings.html': 'https://lfarci.github.io/csharp-quest-tracker/settings.html',
};

test('public pages expose consistent canonical URLs and descriptions', async () => {
  for (const [page, canonical] of Object.entries(canonicalUrls)) {
    const html = await readProjectFile(page);

    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${canonical}">`));
  }
});

test('the home page exposes valid WebApplication structured data', async () => {
  const html = await readProjectFile('index.html');
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  assert.ok(json, 'Structured data block not found');
  const application = JSON.parse(json[1]);
  assert.equal(application['@type'], 'WebApplication');
  assert.equal(application.url, canonicalUrls['index.html']);
});

test('sitemap lists all three canonical pages', async () => {
  const sitemap = await readProjectFile('sitemap.xml');

  for (const url of Object.values(canonicalUrls)) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Missing sitemap entry ${url}`);
  }
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, Object.keys(canonicalUrls).length);
});

test('all HTML pages load the shared early theme script', async () => {
  for (const page of Object.keys(pageStyles)) {
    const html = await readProjectFile(page);
    assert.match(html, /<script src="src\/theme-init\.js"><\/script>/);
  }
});

test('Pages assembly includes the sitemap and runs on main pushes or manual dispatch', async () => {
  const workflow = await readProjectFile('.github/workflows/pages.yml');

  assert.match(workflow, /^\s*cp [^\n]*sitemap\.xml _site\/$/m);
  assert.match(workflow, /^  push:\s*$/m);
  assert.match(workflow, /^    branches:\s*\n      - main\s*$/m);
  assert.match(workflow, /^  workflow_dispatch:\s*$/m);
});
