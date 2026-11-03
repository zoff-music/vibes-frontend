import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { onTestFinished, test } from 'vitest';

// Run against a production platform build served locally, never production.
const origin = process.env.NOT_FOUND_TEST_URL || 'http://127.0.0.1:3107';
const missingPath = '/discovery/notfound-hydration-check';
const browsers = { chromium, webkit };

test('404 content hydrates with delayed chunks and survives client navigation', async () => {
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
  const browser = await browsers[
    process.env.TEST_BROWSER === 'webkit' ? 'webkit' : 'chromium'
  ].launch({ headless: true });
  onTestFinished(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (
      ['error', 'warning'].includes(message.type()) &&
      /hydrat|mismatch/i.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));

  let releaseChunk = () => {};
  const chunkGate = new Promise<void>((resolve) => {
    releaseChunk = resolve;
  });
  onTestFinished(releaseChunk);
  await page.route('**/assets/NotFoundContent-*.js', async (route) => {
    await chunkGate;
    await route.continue();
  });

  const response = await page.goto(`${origin}${missingPath}`, {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(response?.status(), 404);
  const html = await response!.text();
  assert.match(html, /Lost the page\./);
  assert.match(html, /Find a room/);
  assert.match(html, /noindex/);
  const heading = page.getByRole('heading', {
    name: 'Lost the page. Found the beat.',
  });
  await heading.waitFor();
  const serverHeading = await heading.elementHandle();
  assert.ok(serverHeading);
  await page.waitForTimeout(1500);
  assert.ok(await heading.isVisible());
  assert.equal(await heading.count(), 1);
  releaseChunk();

  const challenge = page.getByRole('button', {
    name: 'Beat challenge',
    exact: true,
  });
  await challenge.click();
  await page.getByRole('button', { name: 'Restart', exact: true }).waitFor();
  assert.ok(await serverHeading.evaluate((element) => element.isConnected));
  assert.equal(await heading.count(), 1);
  await page.getByRole('link', { name: 'Back home', exact: true }).click();
  await page.waitForURL(`${origin}/`);
  await page.goBack();
  await heading.waitFor();
  await challenge.waitFor();
  assert.deepEqual(errors, []);
  assert.ok(requested.some((url) => /\/NotFoundContent-.*\.js/.test(url)));
  assert.ok(requested.some((url) => /\/BeatGame-.*\.js/.test(url)));
});

test('normal pages do not request the 404 content or game', async () => {
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
  const browser = await browsers[
    process.env.TEST_BROWSER === 'webkit' ? 'webkit' : 'chromium'
  ].launch({ headless: true });
  onTestFinished(() => browser.close());
  for (const path of ['/', '/electro']) {
    const page = await browser.newPage();
    const requested: string[] = [];
    page.on('request', (request) => requested.push(request.url()));
    await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    assert.equal(
      requested.some((url) => /\/(NotFoundContent|BeatGame)-.*\.js/.test(url)),
      false,
    );
    await page.close();
  }
});

test('an upstream failure keeps the non-404 recovery screen', async () => {
  const errorOrigin =
    process.env.NOT_FOUND_ERROR_TEST_URL || 'http://127.0.0.1:3117';
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(errorOrigin).hostname));
  const browser = await browsers[
    process.env.TEST_BROWSER === 'webkit' ? 'webkit' : 'chromium'
  ].launch({ headless: true });
  onTestFinished(() => browser.close());
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(`${errorOrigin}/electro`, {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(response?.status(), 503);
  await page
    .getByRole('heading', { name: 'Connection Failed', exact: true })
    .waitFor();
  assert.ok(
    await page
      .getByRole('button', { name: 'Try Again', exact: true })
      .isVisible(),
  );
  assert.equal(
    await page
      .getByRole('heading', { name: 'Lost the page. Found the beat.' })
      .count(),
    0,
  );
  assert.deepEqual(errors, []);
});
