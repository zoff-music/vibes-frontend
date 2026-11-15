import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('a saved persistent player participates in the first transition after room hydration', async (context) => {
  const mocks = {
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
          children: h('div', { 'data-room-player-surface': true }, 'Provider surface'),
        });
        window.start = (enabled) => {
          const root = document.getElementById('root');
          root.innerHTML = renderToString(frame(false));
          window.surface = root.querySelector('[data-room-player-surface]');
          hydrate(frame(enabled), root);
        };
        window.minimize = (enabled) => render(frame(enabled, true), document.getElementById('root'));
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
  context.after(() => browser.close());
  for (const enabled of [true, false]) {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
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
    await page.evaluate((enabled) => window.minimize(enabled), enabled);
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
    await page.close();
  }
});
