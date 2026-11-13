import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('leaving a retained player clears the return target until the room is reopened', async (context) => {
  const bundle = await build({
    stdin: {
      contents: `
        import { h, render } from 'preact';
        import { act } from 'preact/test-utils';
        import { useRememberRoom } from './apps/platform/src/hooks/useRememberRoom';

        function Room({ minimized }) {
          useRememberRoom('electro', 'Electro', minimized);
          return null;
        }

        window.renderRoom = (minimized) => act(() => {
          render(h(Room, { minimized }), document.body);
        });
        window.closeRoom = () => act(() => render(null, document.body));
      `,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'iife',
    alias: { react: 'preact/compat', 'react-dom': 'preact/compat' },
    define: { 'process.env.NODE_ENV': '"test"' },
  });
  const browser = await chromium.launch({ headless: true });
  context.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('https://reminder.test/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><body></body>',
    }),
  );
  await page.goto('https://reminder.test/');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const reminder = () =>
    page.evaluate(() => localStorage.getItem('zoff:room-reminder'));

  await page.evaluate(() => window.renderRoom(false));
  assert.equal(await reminder(), 'electro');
  await page.evaluate(() => window.renderRoom(true));
  assert.equal(await reminder(), null);
  assert.match(await page.evaluate(() => document.cookie), /electro/);

  // A retained player must not re-arm the reminder when restoring a page.
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    ),
  );
  assert.equal(await reminder(), null);
  await page.evaluate(() => window.renderRoom(false));
  assert.equal(await reminder(), 'electro');
  await page.evaluate(() => window.renderRoom(true));
  assert.equal(await reminder(), null);
  await page.reload();
  assert.equal(await reminder(), null);

  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(() => window.renderRoom(false));
  assert.equal(await reminder(), 'electro');
  // Reloading while actually in the room still preserves the return target.
  await page.reload();
  assert.equal(await reminder(), 'electro');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(() => window.renderRoom(false));
  await page.evaluate(() => window.closeRoom());
  assert.equal(await reminder(), null);
});
