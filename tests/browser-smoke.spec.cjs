const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://127.0.0.1:8000' });

test('all pages load without JavaScript errors or missing local files', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:8000/')) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const path of ['/index.html', '/about.html', '/settings.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test('the tracker loads, saves a challenge and restores progress', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#tracker')).toBeVisible();

  const challenges = page.locator('.challenge input[type="checkbox"]');
  await expect(challenges).toHaveCount(114);

  await challenges.first().check();
  await expect(challenges.first()).toBeChecked();
  await expect(page.locator('#completed-count')).toContainText('1 / 114');

  await page.reload();
  await expect(page.locator('#tracker')).toBeVisible();
  await expect(page.locator('.challenge input[type="checkbox"]').first()).toBeChecked();
});

test('theme preference works across pages and refresh', async ({ page }) => {
  await page.goto('/settings.html');
  await page.locator('#theme-select').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('/about.html');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('/settings.html');
  await page.locator('#theme-select').selectOption('system');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
});

test('small-screen layout does not overflow horizontally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ['/index.html', '/about.html', '/settings.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();

    const fitsViewport = await page.evaluate(() =>
      document.documentElement.scrollWidth <= document.documentElement.clientWidth
    );
    expect(fitsViewport, `Horizontal overflow on ${path}`).toBe(true);
  }
});

test('activity icons distinguish types and preserve normal completion', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#tracker')).toBeVisible();

  for (const [id, type, label] of [
    ['hello-world', 'challenge', 'Challenge'],
    ['hunting-the-manticore', 'boss-battle', 'Boss Battle'],
    ['knowledge-check-c', 'knowledge-check', 'Knowledge Check'],
  ]) {
    const row = page.locator(`[data-challenge-id="${id}"]`);
    await expect(row.locator('svg.activity-type-icon use'))
      .toHaveAttribute('href', `assets/icons/activity-types.svg#${type}`);
    await expect(row.locator('input[type="checkbox"]')).toHaveAccessibleName(new RegExp(label + ':'));
  }

  await page.locator('[data-challenge-id="hunting-the-manticore"] input').check();
  await expect(page.locator('#completed-count')).toHaveText('1 / 114');
});

test('activity color keys differ by type and adapt in dark mode', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#tracker')).toBeVisible();

  const types = ['challenge', 'boss-battle', 'knowledge-check'];
  const readColors = () => page.evaluate(types => types.map(type => {
    const row = document.querySelector(`.challenge--${type}`);
    const icon = row.querySelector('.activity-type-icon');
    return {
      icon: getComputedStyle(icon).color,
      border: getComputedStyle(row).borderInlineStartColor,
    };
  }), types);

  const light = await readColors();
  expect(new Set(light.map(item => item.icon)).size).toBe(3);
  for (const item of light) expect(item.border).toBe(item.icon);

  await page.goto('/settings.html');
  await page.locator('#theme-select').selectOption('dark');
  await page.goto('/index.html');
  const dark = await readColors();
  expect(new Set(dark.map(item => item.icon)).size).toBe(3);
  for (const item of dark) expect(item.border).toBe(item.icon);
  expect(dark[0].icon).not.toBe(light[0].icon);
});
