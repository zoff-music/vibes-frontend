import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { compile } from 'tailwindcss';

// Exercise the actual queue, controls and Tailwind utilities, without a backend.
test('native find reaches distant queue rows with bounded interactive content', async (context) => {
  const root = process.cwd();
  const sources = await Promise.all(
    ['QueueList', 'QueueBlock', 'QueueItem'].map((name) =>
      readFile(`packages/ui/src/web/components/queue/${name}.tsx`, 'utf8'),
    ),
  );
  const compiler = await compile(`
    @theme { --spacing: 0.25rem; --breakpoint-sm: 40rem; }
    @tailwind utilities;
  `);
  const css = compiler.build(sources.join(' ').split(/[\s"'\x60]+/));
  const bundle = await build({
    absWorkingDir: root,
    stdin: {
      contents: `
        import { hydrate } from 'preact';
        import { useState } from 'preact/hooks';
        import renderToString from 'preact-render-to-string';
        import { LazyMotion, domMax } from 'framer-motion';
        import { QueueList } from './packages/ui/src/web/components/queue/QueueList';
        const items = Array.from({ length: 3500 }, (_, index) => ({
          id: String(index), title: index === 496 ? 'LO QUIERO YA!' : 'Track ' + index,
          publisher: 'Artist ' + index, duration: 180, sourceType: 'youtube',
          sourceId: 'test', voteCount: 0,
        }));
        function App() {
          const [queue, setQueue] = useState(items.slice(0, 12));
          window.loadQueue = () => {
            const started = performance.now();
            setQueue(items);
            requestAnimationFrame(() => { window.snapshotMs = performance.now() - started; });
          };
          return <LazyMotion features={domMax}>
            <QueueList playlistItems={queue} onVote={(id) => {
              window.lastVote = id;
              setQueue((previous) => {
                const voted = previous.find((item) => item.id === id);
                return [{ ...voted, voteCount: voted.voteCount + 1 }, ...previous.filter((item) => item.id !== id)];
              });
            }} />
          </LazyMotion>;
        }
        const started = performance.now();
        const root = document.getElementById('root');
        root.innerHTML = renderToString(<App />);
        const title = [...root.querySelectorAll('h3')].find((node) => node.textContent === 'Track 0');
        hydrate(<App />, root);
        window.queueMountMs = performance.now() - started;
        window.hydrationPreservedTitle = title === [...root.querySelectorAll('h3')].find((node) => node.textContent === 'Track 0');
      `,
      resolveDir: root,
      loader: 'tsx',
    },
    bundle: true,
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    format: 'esm',
    write: false,
    jsx: 'automatic',
    jsxImportSource: 'preact',
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'framer-motion': resolve('apps/platform/node_modules/framer-motion'),
    },
  });
  const server = createServer((request, response) => {
    const script = request.url === '/app.js';
    response.setHeader(
      'Content-Type',
      script ? 'text/javascript' : 'text/html',
    );
    response.end(
      script
        ? bundle.outputFiles[0].text
        : `<!doctype html><html><head>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>${css}body{margin:0;font:14px sans-serif}*{box-sizing:border-box}h3{margin:0}
      @media(min-width:1024px){#root{height:600px;overflow-y:auto}}</style>
      </head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`,
    );
  });
  context.after(() => server.close());
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch({ headless: true });
  context.after(() => browser.close());

  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const started = performance.now();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('button', { name: /^Vote for Track 0 by/ }).waitFor();
    await page.waitForTimeout(150);
    assert.equal(
      await page.evaluate(() => window.hydrationPreservedTitle),
      true,
    );
    assert.equal(await page.locator('h3').count(), 12);
    await page.evaluate(() => window.loadQueue());
    await page.waitForFunction(
      () =>
        document.querySelectorAll('h3').length === 3500 &&
        window.snapshotMs > 0,
    );
    assert.ok(
      (await page.locator('img').count()) < 72,
      'artwork stays windowed',
    );
    assert.ok(
      (await page.locator('button').count()) < 72,
      'controls stay windowed',
    );
    context.diagnostic(
      `3,500 songs, 4× CPU slowdown: mount + hydration ${Math.round(await page.evaluate(() => window.queueMountMs))}ms; ${await page.locator('button').count()} controls; ${await page.locator('*').count()} DOM nodes; full snapshot ${Math.round(await page.evaluate(() => window.snapshotMs))}ms`,
    );
    context.diagnostic(
      `${width}px: SSR + hydration + settling ${Math.round(performance.now() - started)}ms`,
    );

    for (const query of ['LO QUIERO YA!', 'Artist 3499', 'Track 0']) {
      assert.equal(
        await page.evaluate((query) => {
          window.getSelection().removeAllRanges();
          window.scrollTo(0, 0);
          document.getElementById('root').scrollTop = 0;
          const found = window.find(query);
          // window.find exposes native text matching, but unlike the browser's
          // Find UI it does not reveal the selection in headless Chromium.
          window
            .getSelection()
            .anchorNode?.parentElement?.scrollIntoView({ block: 'center' });
          return found;
        }, query),
        true,
      );
      const id =
        query === 'LO QUIERO YA!'
          ? '496'
          : query === 'Artist 3499'
            ? '3499'
            : '0';
      const row = page.locator(`[data-queue-row="${id}"]`);
      await row
        .getByRole('button', { name: /^Vote for/ })
        .waitFor({ timeout: 3000 });
      assert.equal(
        await page.evaluate(() => window.getSelection().toString()),
        query,
        'mounting controls preserves the native find selection',
      );
      const bounds = await row.boundingBox();
      assert.ok(
        bounds.y < 800 && bounds.y + bounds.height > 0,
        'revealing the match scrolls the row into view',
      );
      await row.getByRole('button', { name: /^Vote for/ }).click();
      assert.equal(await page.evaluate(() => window.lastVote), id);
      await page.waitForFunction(
        (id) =>
          document
            .querySelector('[data-queue-row]')
            ?.getAttribute('data-queue-row') === id,
        id,
      );
      assert.ok(
        (await page.locator('img').count()) < 96,
        'jumping keeps artwork bounded',
      );
      assert.ok(
        (await page.locator('button').count()) < 96,
        'jumping keeps controls bounded',
      );
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
});
