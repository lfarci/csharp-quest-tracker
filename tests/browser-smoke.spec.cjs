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
