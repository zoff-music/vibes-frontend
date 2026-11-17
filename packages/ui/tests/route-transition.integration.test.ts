import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium, webkit } from 'playwright';
import { afterEach, test, vi } from 'vitest';

test('route transitions hand off documents without starting a same-document capture', async (context) => {
  const bundle = await build({
    stdin: {
      contents: `
        import * as transitions from './packages/ui/src/web/routeTransition';
        window.transitions = transitions;
      `,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'iife',
  });
  const browserType =
    process.env.PLAYER_BROWSER === 'webkit' ? webkit : chromium;
  const browser = await browserType.launch({ headless: true });
  context.onTestFinished(() => browser.close());
  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });

  for (const handler of [
    'pageViewTransition',
    'sceneViewTransition',
    'immediateViewTransition',
  ] as const) {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      for (const destination of [
        'https://zoff.me/admin',
        'https://example.com/',
        'http://localhost:3005/admin',
      ]) {
        const result = await page.evaluate(
          ({ handler, destination }) => {
            const commits: unknown[] = [];
            let captures = 0;
            document.startViewTransition = () => {
              captures += 1;
              throw new Error('Departures must not start a SPA capture');
            };
            window.transitions[handler](
              (options) => commits.push(options ?? null),
              {
                url: 'https://zoff.me/',
                loaded: true,
                params: {},
                state: 'idle',
              },
              { url: destination, leaving: true, params: {}, state: 'loading' },
            );
            return { commits, captures };
          },
          { handler, destination },
        );
        assert.equal(result.captures, 0);
        const optIn =
          destination === 'https://zoff.me/admin' &&
          reducedMotion === 'no-preference';
        assert.deepEqual(result.commits, [
          optIn ? { crossDocument: [] } : null,
        ]);
      }
    }
  }

  // Hydration commits immediately, preserving the incoming browser transition.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const initial = await page.evaluate(() => {
    let commits = 0;
    let captures = 0;
    document.startViewTransition = () => {
      captures += 1;
      throw new Error('Hydration must preserve the incoming transition');
    };
    window.transitions.pageViewTransition(
      () => {
        commits += 1;
      },
      { url: 'https://zoff.me/', loaded: false, params: {}, state: 'idle' },
      { url: 'https://zoff.me/admin', loaded: true, params: {}, state: 'idle' },
    );
    return { commits, captures };
  });
  assert.deepEqual(initial, { commits: 1, captures: 0 });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
