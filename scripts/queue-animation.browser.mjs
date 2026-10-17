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
  }

  assert.deepEqual(errors, []);
});
