import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { afterEach, test, vi } from 'vitest';

test('a saved persistent player participates in the first transition after room hydration', async (context) => {
  const mocks: Record<string, string> = {
    '@vibes/shared':
      'export const classNames = (...values) => values.filter(Boolean).join(" ");',
    '@kasperrt/smolter/preact': 'export const Link = "a";',
    '../icons': 'export const CloseIcon = "span";',
    './IconButton': 'export const IconButton = "button";',
  };
  const bundle = await build({
    stdin: {
      contents: `
        import { h, hydrate, render } from 'preact';
        import { renderToString } from 'preact-render-to-string';
        import { PersistentPlayerFrame } from './packages/ui/src/web/components/PersistentPlayerFrame';
        const frame = (persistent, minimized = false) => h(PersistentPlayerFrame, {
          persistent, minimized, roomName: 'Fixture', roomHref: '/fixture', onClose() {},
          children: h('div', { 'data-room-player-surface': true, 'data-player-viewport': true }, 'Provider surface'),
        });
        window.start = (enabled) => {
          const root = document.getElementById('root');
          root.innerHTML = renderToString(frame(false));
          window.surface = root.querySelector('[data-room-player-surface]');
          hydrate(frame(enabled), root);
        };
        window.minimize = (enabled, minimized = true) => render(frame(enabled, minimized), document.getElementById('root'));
      `,
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    jsx: 'automatic',
    jsxImportSource: 'preact',
    alias: { react: 'preact/compat' },
    plugins: [
      {
        name: 'player-controls',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, ({ path }) => {
            if (Object.hasOwn(mocks, path))
              return { path, namespace: 'fixture' };
          });
          builder.onLoad(
            { filter: /.*/, namespace: 'fixture' },
            ({ path }) => ({ contents: mocks[path] }),
          );
        },
      },
    ],
  });
  const browser = await chromium.launch({ headless: true });
  context.onTestFinished(() => browser.close());
  for (const enabled of [true, false]) {
    const page = await browser.newPage();
    await page.setContent(`<style>
      [data-player-persistent], [data-player-viewport] { transform-origin: top left }
      [data-player-viewport] { width: 640px; height: 400px }
      [data-minimized=true] { position: fixed; right: 16px; bottom: 16px }
      [data-minimized=true] [data-player-viewport] { width: 320px; height: 200px }
    </style><div id="root"></div>`);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.evaluate((enabled) => window.start(enabled), enabled);
    await page.waitForFunction(
      (enabled) =>
        document
          .querySelector('[data-player-persistent]')
          ?.getAttribute('data-player-persistent') === String(enabled),
      enabled,
    );
    assert.equal(
      await page.evaluate(
        () =>
          window.surface ===
          document.querySelector('[data-room-player-surface]'),
      ),
      true,
    );
    await page.evaluate((enabled) => {
      window.minimize(enabled);
      if (enabled)
        document
          .querySelector('[data-minimized=true]')
          ?.getAnimations()[0]
          ?.pause();
    }, enabled);
    assert.equal(
      await page
        .locator('[data-player-persistent]')
        .getAttribute('data-player-persistent'),
      String(enabled),
    );
    assert.equal(
      await page.evaluate(
        () =>
          window.surface ===
          document.querySelector('[data-room-player-surface]'),
      ),
      true,
    );
    if (enabled) {
      // Reverse mid-flight. The restored player must begin at exactly the
      // visible position of the docking player, with the same provider node.
      const continuous = await page.evaluate(() => {
        const surface = window.surface;
        const dock = document
          .querySelector('[data-minimized=true]')
          ?.getAnimations()[0];
        if (!surface || !dock) return false;
        dock.currentTime = 100;
        const before = surface.getBoundingClientRect();
        window.minimize(true, false);
        const restore = surface.getAnimations()[0];
        if (!restore) return false;
        restore.pause();
        restore.currentTime = 0;
        const after = surface.getBoundingClientRect();
        restore.finish();
        return (
          Math.abs(before.x - after.x) < 1 &&
          Math.abs(before.y - after.y) < 1 &&
          Math.abs(before.width - after.width) < 1 &&
          window.surface === document.querySelector('[data-player-viewport]')
        );
      });
      assert.equal(continuous, true);
      await page.waitForSelector('[data-player-in-flight]', {
        state: 'detached',
      });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => window.minimize(true));
      assert.equal(await page.locator('[data-player-in-flight]').count(), 0);
    }
    await page.close();
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
