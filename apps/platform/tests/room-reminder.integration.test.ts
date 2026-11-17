import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { afterEach, test, vi } from 'vitest';

test('leaving a retained player clears the return target until the room is reopened', async (context) => {
  const bundle = await build({
    stdin: {
      contents: `
        import { h, render } from 'preact';
        import { act } from 'preact/test-utils';
        import { useRememberRoom } from './apps/platform/src/hooks/useRememberRoom';

        function Room({ minimized }) {
          useRememberRoom('electro', 'Electro', minimized, 'MUSIC');
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
  context.onTestFinished(() => browser.close());
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

test('an ineligible or restored homepage cannot erase another tab’s return target', async (context) => {
  const bundle = await build({
    stdin: {
      contents: `
        import { h, render } from 'preact';
        import { act } from 'preact/test-utils';
        import { ReturnToRoom } from './apps/platform/src/routes/_index/components/ReturnToRoom';
        import { clientLoader } from './apps/platform/src/routes/resources.recents/clientLoader';
        window.loadReminder = () => clientLoader({ request: new Request(location.href) });
        window.mountReminder = () => act(() => render(h(ReturnToRoom, {
          onJoinRoom: (roomId) => { window.joined = roomId; },
        }), document.body));
      `,
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    alias: { react: 'preact/compat', 'react-dom': 'preact/compat' },
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [
      {
        name: 'reminder-fixture',
        setup(builder) {
          const mocks: Record<string, string> = {
            '@vibes/api': `
            export const getHttpError = () => null;
            export const api = { v2: { get: async (path) => [null,
              path.endsWith('/states') ? { currentPlaylistItem: null, isPlaying: false }
              : { id: 'electro', name: 'Electro', userCount: 0 }
            ] } };
          `,
            '@kasperrt/smolter/preact': `
            import { useState, useCallback } from 'preact/hooks';
            export const useURLLocation = () => location;
            export function useFetcher() {
              const [data, setData] = useState();
              const load = useCallback(async () => setData(await window.loadReminder()), []);
              return { data, load };
            }
          `,
            './ReturnToRoomCard': 'export const ReturnToRoomCard = () => null;',
          };
          builder.onResolve({ filter: /.*/ }, ({ path }) => {
            if (Object.hasOwn(mocks, path))
              return { path, namespace: 'fixture' };
          });
          builder.onLoad(
            { filter: /.*/, namespace: 'fixture' },
            ({ path }) => ({
              contents: mocks[path],
              resolveDir: process.cwd(),
            }),
          );
        },
      },
    ],
  });
  const browser = await chromium.launch({ headless: true });
  context.onTestFinished(() => browser.close());
  const session = await browser.newContext();
  await session.route('https://reminder.test/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><body></body>',
    }),
  );
  const olderTab = await session.newPage();
  await olderTab.goto('https://reminder.test/', {
    referer: 'https://reminder.test/electro',
  });
  await olderTab.addScriptTag({ content: bundle.outputFiles[0].text });
  await olderTab.evaluate(() => window.mountReminder());

  // A different room tab has since saved its return target and preference.
  const roomTab = await session.newPage();
  await roomTab.goto('https://reminder.test/electro');
  await roomTab.evaluate(() => {
    localStorage.setItem('zoff:room-reminder', 'electro');
    localStorage.setItem(
      'zoff-auto-rejoin',
      JSON.stringify({ state: { enabled: true }, version: 0 }),
    );
  });
  await roomTab.close();

  assert.deepEqual(await olderTab.evaluate(() => window.loadReminder()), {
    room: null,
  });
  assert.equal(
    await olderTab.evaluate(() => localStorage.getItem('zoff:room-reminder')),
    'electro',
  );
  await olderTab.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    ),
  );
  assert.equal(
    await olderTab.evaluate(() => localStorage.getItem('zoff:room-reminder')),
    'electro',
  );
  assert.equal(await olderTab.evaluate(() => window.joined), undefined);
  await olderTab.close();

  const newTab = await session.newPage();
  await newTab.goto('https://reminder.test/');
  await newTab.addScriptTag({ content: bundle.outputFiles[0].text });
  await newTab.evaluate(() => window.mountReminder());
  await newTab.waitForFunction(() => window.joined === 'electro');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
