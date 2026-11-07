import assert from 'node:assert/strict';
import { type Browser, chromium, type Page, webkit } from 'playwright';
import type { ViteDevServer } from 'vite';
import { afterAll, beforeAll, test } from 'vitest';
import { startPlayerFixture } from './server';

// The YouTube embed is about 1 MB of provider script. These tests pin when it mounts: at once for a
// visitor arriving with user activation (room navigation) or whose browser allows audible autoplay,
// and on the first interaction for a cold, gesture-less visit, which still starts audibly on click.
const browsers = { chromium, webkit };
const embed = 'iframe[title="YouTube SDK test double"]';
let server: ViteDevServer;
let browser: Browser;
let origin: string;

beforeAll(async () => {
  server = await startPlayerFixture(false);
  const url = server.resolvedUrls?.local[0];
  assert.ok(url);
  origin = url;
  browser = await browsers[
    process.env.PLAYER_BROWSER === 'webkit' ? 'webkit' : 'chromium'
  ].launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH &&
      process.env.PLAYER_BROWSER !== 'webkit' && {
        executablePath: process.env.CHROMIUM_PATH,
      }),
  });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function open(policy: 'allowed' | 'disallowed') {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  page.setDefaultTimeout(15_000);
  await page.route('https://**/*', (route) => route.abort());
  await page.addInitScript((policy) => {
    Object.defineProperty(Navigator.prototype, 'getAutoplayPolicy', {
      configurable: true,
      value: () => policy,
    });
  }, policy);
  return page;
}

async function playsAudibly(page: Page) {
  await page.waitForFunction(
    () => {
      const value = window.playerTest.sample('youtube');
      return !value.paused && !value.muted && value.volume > 0;
    },
    null,
    { timeout: 5_000 },
  );
  await page
    .locator('[data-provider="youtube"][data-provider-playing="true"]')
    .waitFor({ state: 'attached', timeout: 2_000 });
}

test('room navigation with user activation mounts the embed and plays without a prompt', async ({
  onTestFinished,
}) => {
  const page = await open('disallowed');
  onTestFinished(() => page.close());
  await page.goto(`${origin}?sequence=youtube,youtube&entry=1&autoplay=1`);
  await page.getByRole('button', { name: 'Enter room' }).click();
  await page.locator(embed).waitFor({ state: 'attached', timeout: 1_000 });
  await playsAudibly(page);
  assert.equal(
    await page.getByRole('button', { name: 'Click to play' }).count(),
    0,
    'arriving from another page must not ask for a second gesture',
  );
});

test('browsers that allow audible autoplay mount the embed without interaction', async ({
  onTestFinished,
}) => {
  const page = await open('allowed');
  onTestFinished(() => page.close());
  await page.goto(`${origin}?sequence=youtube,youtube&autoplay=1`);
  await page.locator(embed).waitFor({ state: 'attached', timeout: 1_000 });
  await playsAudibly(page);
});

test('a cold visit defers the embed until interaction and still starts audibly on click', async ({
  onTestFinished,
}) => {
  const page = await open('disallowed');
  onTestFinished(() => page.close());
  await page.goto(`${origin}?sequence=youtube,youtube`);
  const prompt = page
    .locator('[data-provider="youtube"]')
    .getByRole('button', { name: 'Click to play' });
  await prompt.waitFor();
  await page.waitForTimeout(1_500);
  assert.equal(
    await page.locator(embed).count(),
    0,
    'no embed before the visitor interacts',
  );
  assert.equal(await prompt.count(), 1, 'the prompt stays while deferred');
  await page.evaluate(() => {
    window.playerTest.faults.blocked = false;
  });
  await prompt.click();
  await playsAudibly(page);
  assert.equal(await prompt.count(), 0);
});

test('a cold visit mounts the embed on the first pointer movement, before any click', async ({
  onTestFinished,
}) => {
  const page = await open('disallowed');
  onTestFinished(() => page.close());
  await page.goto(`${origin}?sequence=youtube,youtube`);
  await page
    .locator('[data-provider="youtube"]')
    .getByRole('button', { name: 'Click to play' })
    .waitFor();
  assert.equal(await page.locator(embed).count(), 0);
  await page.mouse.move(120, 200);
  await page.mouse.move(160, 240);
  await page.locator(embed).waitFor({ state: 'attached', timeout: 1_000 });
});
