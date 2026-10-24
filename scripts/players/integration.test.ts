import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { onTestFinished, test } from 'vitest';
import { startPlayerFixture } from './server';
import type { Provider } from './types';

const browsers = { chromium, webkit };

test.each([
  'soundcloud,soundcloud',
  'youtube,youtube',
  'soundcloud,youtube',
  'youtube,soundcloud',
])(
  'production players %s: startup, transitions, pause and seek recovery',
  {
    timeout: 240_000,
  },
  async (sequence) => {
    const server = await startPlayerFixture(false);
    onTestFinished(() => server.close());
    const origin = server.resolvedUrls?.local[0];
    assert.ok(origin);
    const browser = await browsers[
      process.env.PLAYER_BROWSER === 'webkit' ? 'webkit' : 'chromium'
    ].launch({
      headless: true,
      ...(process.env.CHROMIUM_PATH && {
        executablePath: process.env.CHROMIUM_PATH,
      }),
    });
    onTestFinished(() => browser.close());
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    page.setDefaultTimeout(15_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    await page.route('https://**/*', (route) => route.abort());

    async function confirmsPlayback(provider: Provider, id: string) {
      await page
        .waitForFunction(
          ({ provider, id }) => {
            const value = window.playerTest.sample(provider);
            return (
              value.id === id &&
              !value.paused &&
              value.position > 1000 &&
              !value.muted &&
              value.volume > 0
            );
          },
          { provider, id },
          { timeout: 15_000 },
        )
        .catch(async (error: unknown) => {
          console.error(
            'Playback failure',
            provider,
            id,
            await page.evaluate(
              (provider) => ({
                sdk: window.playerTest.sample(provider),
                body: document.body.innerText,
                faults: window.playerTest.faults,
              }),
              provider,
            ),
          );
          throw error;
        });
      // Returning to a prewarmed provider may apply its pending room-position
      // seek after playback starts. Measure sustained progress after it settles.
      await page.waitForTimeout(2000);
      const first = await page.evaluate(
        (provider) => window.playerTest.sample(provider),
        provider,
      );
      await page.waitForTimeout(1500);
      const second = await page.evaluate(
        (provider) => window.playerTest.sample(provider),
        provider,
      );
      assert.equal(second.paused, false);
      assert.equal(
        await page
          .locator(`[data-provider="${provider}"]`)
          .getAttribute('data-provider-playing'),
        'true',
        'rendered player state must agree with advancing SDK playback',
      );
      assert.ok(
        second.position - first.position > 900,
        'SDK clock must keep advancing, not just the room clock',
      );
      const inactive: Provider =
        provider === 'soundcloud' ? 'youtube' : 'soundcloud';
      if (await page.locator(`[data-provider="${inactive}"]`).count()) {
        assert.equal(
          await page.evaluate(
            (provider) => window.playerTest.sample(provider).paused,
            inactive,
          ),
          true,
          'inactive player must be silent',
        );
      }
      assert.equal(
        await page
          .locator('[aria-hidden="false"]')
          .getByRole('button', { name: 'Click to play' })
          .count(),
        0,
      );
    }

    onTestFinished(async () => {
      await mkdir('test-results/players', { recursive: true });
      await page.screenshot({
        path: `test-results/players/${sequence.replaceAll(',', '-')}.png`,
      });
    });
    await page.goto(`${origin}?sequence=${sequence}`);
    const prompt = page
      .locator('[data-provider][aria-hidden="false"]')
      .getByRole('button', { name: 'Click to play' });
    await prompt.waitFor().catch(async (error: Error) => {
      console.error(
        'Startup failure',
        await page.evaluate(() => ({
          text: document.body.innerText,
          fixture: !!window.playerTest,
          faults: window.playerTest?.faults,
        })),
      );
      throw error;
    });
    await page.waitForTimeout(1200);
    assert.equal(
      await prompt.count(),
      1,
      'startup prompt stays until playback is actually unlocked',
    );
    await page.evaluate(() => {
      window.playerTest.faults.blocked = false;
    });
    await prompt.click();
    const [first, second] = sequence.split(',') as [Provider, Provider];
    await confirmsPlayback(first, '101');
    console.log(sequence, 'startup confirmed');
    await page.evaluate(() => {
      window.overlayFlashed = false;
      window.overlayFrames = [];
      const frame = () => {
        const active = document.querySelector(
          '[data-provider][aria-hidden="false"]',
        );
        if (
          [...(active?.querySelectorAll('button') || [])].some((button) =>
            button.textContent?.includes('Click to play'),
          )
        ) {
          window.overlayFlashed = true;
          window.overlayFrames.push(
            active?.getAttribute('data-provider') ?? null,
          );
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
    const history = await page.evaluate(() => window.history.length);
    const seeksBeforeSkip = await page.evaluate(
      () => window.playerTest.faults.seeks,
    );
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await confirmsPlayback(second, '102');
    if (first === 'soundcloud' && second === 'soundcloud') {
      assert.equal(
        await page.evaluate(() => window.playerTest.faults.seeks),
        seeksBeforeSkip,
        'an aligned new SoundCloud track must not receive a forced reset seek',
      );
    }
    console.log(sequence, 'skip confirmed');
    assert.equal(await page.evaluate(() => window.history.length), history);
    const seeksBeforeEnd = await page.evaluate(
      () => window.playerTest.faults.seeks,
    );
    await page.evaluate(() => window.playerTest.finish());
    await confirmsPlayback(first, '101');
    if (first === 'soundcloud' && second === 'soundcloud') {
      assert.equal(
        await page.evaluate(() => window.playerTest.faults.seeks),
        seeksBeforeEnd,
        'natural transitions must not force an aligned SoundCloud track to seek',
      );
    }
    console.log(sequence, 'end confirmed');
    assert.equal(await page.evaluate(() => window.playerTest.ends()), 1);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.waitForFunction(
      (provider) => window.playerTest.sample(provider).paused,
      first,
    );
    await page.waitForTimeout(1200);
    assert.equal(
      await page.evaluate(
        (provider) => window.playerTest.sample(provider).paused,
        first,
      ),
      true,
    );
    assert.equal(
      await page
        .locator(`[data-provider="${first}"]`)
        .getAttribute('data-provider-playing'),
      'false',
    );
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await confirmsPlayback(first, '101');
    const seeks = await page.evaluate(() => window.playerTest.faults.seeks);
    const providerSeeks = await page.evaluate(
      (provider) => window.playerTest.sample(provider).seeks,
      first,
    );
    for (let count = 0; count < 10; count++)
      await page.getByRole('button', { name: 'Reset', exact: true }).click();
    // Allow the asynchronous seek to land before measuring a monotonic clock.
    await page.waitForTimeout(4500);
    await confirmsPlayback(first, '101');
    assert.ok(
      (await page.evaluate(
        (provider) => window.playerTest.sample(provider).seeks,
        first,
      )) > providerSeeks,
      'explicit Reset must still issue a real provider seek',
    );
    await page.waitForFunction(() => !window.playerTest.changed(), null, {
      timeout: 15_000,
    });
    assert.ok(
      (await page.evaluate(() => window.playerTest.faults.seeks)) - seeks <= 3,
      'reset requests must coalesce',
    );
    assert.equal(
      await page.evaluate(() => window.playerTest.faults.loadingPauseCalls),
      0,
      'transitional PLAY must not force-pause loading SoundCloud',
    );
    assert.deepEqual(
      await page.evaluate(() => window.overlayFrames),
      [],
      'gesture prompt must not flash during healthy playback or provider transitions',
    );
    assert.deepEqual(errors, []);
  },
);
