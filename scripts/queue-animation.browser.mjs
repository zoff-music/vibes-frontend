import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

// Run with an externally installed Playwright; it is not a product dependency.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);

test('queue exits move surviving rows once, including rapid updates and reduced motion', async (context) => {
  const root = process.cwd();
  const result = await build({
    absWorkingDir: root,
    stdin: {
      contents: `
        import { render } from 'preact';
        import { useState } from 'preact/hooks';
        import { LazyMotion, domMax, m } from 'framer-motion';
        import { QueueList } from './packages/ui/src/web/components/queue/QueueList';

        function App() {
          const [items, setItems] = useState(Array.from({ length: 10 }, (_, index) => ({ id: String(index) })));

          return <LazyMotion features={domMax}>
            <button onClick={() => setItems((previous) => previous.slice(1))}>Next</button>
            <button onClick={() => setItems((previous) => [previous[1], previous[0], ...previous.slice(2)])}>Vote</button>
            <m.div layoutScroll><QueueList playlistItems={items} /></m.div>
          </LazyMotion>;
        }

        render(<App />, document.getElementById('root'));
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
    plugins: [
      {
        name: 'queue-row-fixture',
        setup(builder) {
          builder.onResolve({ filter: /\.\/QueueItem$/ }, () => ({
            path: 'item',
            namespace: 'fixture',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: `export const QueueItem = ({ playlistItem }) => <article data-id={playlistItem.id}>Track {playlistItem.id}</article>;`,
            loader: 'tsx',
            resolveDir: root,
          }));
        },
      },
    ],
  });
  const server = createServer((request, response) => {
    const script = request.url === '/app.js';
    response.setHeader(
      'Content-Type',
      script ? 'text/javascript' : 'text/html',
    );
    response.end(
      script
        ? result.outputFiles[0].text
        : '<html><head><style>body{margin:0}article{height:80px}.relative{position:relative}.space-y-2>:not(:last-child){margin-bottom:8px}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
  });
  context.after(() => server.close());
  await new Promise((done) => server.listen(0, '127.0.0.1', done));

  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH && {
      executablePath: process.env.CHROMIUM_PATH,
    }),
  });
  context.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const origin = `http://127.0.0.1:${server.address().port}`;

  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    await page.goto(origin);
    await page.getByText('Next', { exact: true }).waitFor();
    await page.waitForTimeout(200);

    for (const [target, clicks] of [
      ['1', 1],
      ['3', 2],
    ]) {
      const samples = await page.evaluate(
        async ({ target, clicks }) => {
          const row = document.querySelector(`[data-id="${target}"]`);
          const positions = [row.getBoundingClientRect().top];
          const start = performance.now();
          const button = [...document.querySelectorAll('button')].find(
            (item) => item.textContent === 'Next',
          );
          button.click();
          if (clicks === 2) setTimeout(() => button.click(), 60);

          await new Promise((done) => {
            function frame() {
              positions.push(row.getBoundingClientRect().top);
              if (performance.now() - start < 1200)
                requestAnimationFrame(frame);
              else done();
            }
            requestAnimationFrame(frame);
          });
          return positions;
        },
        { target, clicks },
      );

      assert.ok(
        samples.at(-1) < samples[0] - 70,
        'survivor reaches the first row',
      );
      if (reducedMotion === 'no-preference') {
        assert.ok(
          samples.some(
            (top) => top < samples[0] - 5 && top > samples.at(-1) + 5,
          ),
          'visible queue changes still animate through intermediate positions',
        );
      }
      for (let index = 1; index < samples.length; index++) {
        assert.ok(
          samples[index] <= samples[index - 1] + 1,
          `row jumped backward: ${samples[index - 1]} → ${samples[index]}`,
        );
      }
    }

    await page.getByText('Vote', { exact: true }).click();
    await page.waitForTimeout(600);
    const order = await page
      .locator('article')
      .evaluateAll((rows) => rows.map((row) => row.dataset.id));
    assert.deepEqual(order.slice(0, 2), ['4', '3']);

    // Exercise hidden updates and an exit interrupted by hiding. A controlled
    // visibility event lets this run deterministically in headless Chromium.
    for (const interruptExit of [false, true]) {
      await page.goto(origin);
      await page.getByText('Next', { exact: true }).waitFor();
      await page.waitForTimeout(200);
      await page.evaluate(async (interruptExit) => {
        const next = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Next',
        );
        if (interruptExit) {
          next.click();
          await new Promise((done) => requestAnimationFrame(done));
        }
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'hidden',
        });
        document.dispatchEvent(new Event('visibilitychange'));
      }, interruptExit);
      await page.waitForTimeout(50);
      await page.evaluate(() => {
        const next = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Next',
        );
        for (let count = 0; count < 4; count++) next.click();
      });
      await page.waitForTimeout(50);
      const target = interruptExit ? '5' : '4';
      const samples = await page.evaluate(async (target) => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'visible',
        });
        document.dispatchEvent(new Event('visibilitychange'));
        const samples = [];
        for (let frame = 0; frame < 30; frame++) {
          await new Promise((done) => requestAnimationFrame(done));
          const rows = [...document.querySelectorAll('article')];
          samples.push({
            ids: rows.map((row) => row.dataset.id),
            top: document
              .querySelector(`[data-id="${target}"]`)
              .getBoundingClientRect().top,
          });
        }
        return samples;
      }, target);
      for (const sample of samples) {
        assert.equal(sample.ids[0], target, 'no stale exiting rows on resume');
        assert.ok(
          Math.abs(sample.top - samples.at(-1).top) < 1,
          'resume snaps to current queue',
        );
      }

      // Resuming must not disable the next genuine visible update.
      const positions = await page.evaluate(async () => {
        const row = document.querySelectorAll('article')[1];
        const positions = [row.getBoundingClientRect().top];
        [...document.querySelectorAll('button')]
          .find((button) => button.textContent === 'Next')
          .click();
        for (let frame = 0; frame < 45; frame++) {
          await new Promise((done) => requestAnimationFrame(done));
          positions.push(row.getBoundingClientRect().top);
        }
        return positions;
      });
      assert.ok(positions.at(-1) < positions[0] - 70);
      if (reducedMotion === 'no-preference') {
        assert.ok(
          positions.some(
            (top) => top < positions[0] - 5 && top > positions.at(-1) + 5,
          ),
        );
      }
    }
  }

  assert.deepEqual(errors, []);
});
