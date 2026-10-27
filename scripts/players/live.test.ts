import assert from 'node:assert/strict';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { expect, onTestFinished, test } from 'vitest';
import { startPlayerFixture } from './server';
import type { Track } from './types';

interface WidgetSnapshot {
  provider: string;
  id: string;
  position: number;
  paused: boolean;
}

interface SoundCloudInspector {
  getCurrentSound: (callback: (track: { id: number }) => void) => void;
}

interface YouTubeInspector {
  get: (id: string) =>
    | {
        getVideoData: () => { video_id: string };
        getCurrentTime: () => number;
        getPlayerState: () => number;
      }
    | undefined;
}

declare global {
  interface Window {
    YT?: YouTubeInspector;
  }
}

// Real official embeds in an isolated localhost fixture. No Zoff backend/room.
// No search, paid API calls, credentials, extracted streams or DB writes.
// PLAYER_TRACKS='[{"provider":"soundcloud","id":"..."}, ...]'
// Order: SoundCloud A, SoundCloud B, YouTube A, YouTube B (full playable tracks).
const playlist: Track[] = JSON.parse(process.env.PLAYER_TRACKS || '[]');

const browsers = { chromium, webkit };

test('local official widgets keep playing across skips and natural transitions', {
  timeout: 1_800_000,
}, async () => {
  await mkdir('test-results/players', { recursive: true });
  await writeFile('test-results/players/live-progress.jsonl', '');
  assert.equal(
    playlist.length,
    4,
    'PLAYER_TRACKS must contain four {provider,id} entries in queue order',
  );
  assert.deepEqual(
    playlist.map((item) => item.provider),
    ['soundcloud', 'soundcloud', 'youtube', 'youtube'],
  );
  assert.ok(
    playlist.every((item) => typeof item.id === 'string' && item.id.length > 0),
  );
  const server = await startPlayerFixture(true);
  onTestFinished(() => server.close());
  const origin = server.resolvedUrls?.local[0];
  assert.ok(origin);
  const url = new URL(origin);
  url.searchParams.set(
    'sequence',
    playlist.map((item) => item.provider).join(','),
  );
  url.searchParams.set('tracks', JSON.stringify(playlist));
  const browser = await browsers[
    process.env.PLAYER_BROWSER === 'webkit' ? 'webkit' : 'chromium'
  ].launch({
    headless: !process.env.HEADED,
    ...(process.env.CHROMIUM_PATH && {
      executablePath: process.env.CHROMIUM_PATH,
    }),
  });
  onTestFinished(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  onTestFinished(async () => {
    const element = await page
      .locator('[data-provider][aria-hidden="false"] iframe')
      .elementHandle();
    const frame = await element?.contentFrame();
    if (frame)
      console.error(
        'Final provider state',
        await frame.evaluate(() => ({
          commands: window.providerCommands,
          media: [
            ...window.observedMedia,
            ...document.querySelectorAll<HTMLMediaElement>('audio,video'),
          ].map((media) => ({
            paused: media.paused,
            muted: media.muted,
            volume: media.volume,
            ready: media.readyState,
            error: media.error?.message,
            position: media.currentTime,
          })),
        })),
      );
  });
  onTestFinished(async () => {
    await mkdir('test-results/players', { recursive: true });
    await page.screenshot({ path: 'test-results/players/live.png' });
  });
  page.on('pageerror', (error) => console.error(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error')
      console.error('Provider console', message.text());
  });
  page.on('requestfailed', (request) =>
    console.error(
      'Provider request failed',
      new URL(request.url()).hostname,
      request.failure()?.errorText,
    ),
  );
  await page.addInitScript(() => {
    window.observedMedia = new Set();
    window.observedAudioOutputs = new Set();
    // SoundCloud may use Web Audio instead of an HTML audio element. Observe
    // the actual output signal without substituting the provider's playback.
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = new Proxy(connect, {
      apply(target, source: AudioNode, args: unknown[]) {
        if (args[0] !== source.context.destination)
          return Reflect.apply(target, source, args);

        const analyser = source.context.createAnalyser();
        window.observedAudioOutputs.add(analyser);
        Reflect.apply(target, analyser, [source.context.destination]);
        Reflect.apply(target, source, [analyser, ...args.slice(1)]);
        return source.context.destination;
      },
    });
    window.providerCommands = [];
    window.addEventListener('message', (event) => {
      if (
        typeof event.data === 'string' &&
        /"method":"(play|pause|setVolume|seekTo)"/.test(event.data)
      )
        window.providerCommands.push(event.data.slice(0, 100));
    });
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      window.observedMedia.add(this);
      return Reflect.apply(original, this, args);
    };
  });
  await page.route(/https?:\/\/([^/]*\.)?zoff\.me(?:\/|$)/, (route) =>
    route.abort(),
  );
  await page.goto(url.href, { waitUntil: 'domcontentloaded' });

  async function snapshot() {
    return page.evaluate(async (): Promise<WidgetSnapshot | null> => {
      const active = document.querySelector(
        '[data-provider][aria-hidden="false"]',
      );
      const provider = active?.getAttribute('data-provider');
      if (!active) return null;
      if (provider === 'soundcloud' && window.SC) {
        const frame = active.querySelector('iframe');
        if (!frame) return null;
        const widget = window.SC.Widget(frame) as ReturnType<
          NonNullable<Window['SC']>['Widget']
        > &
          SoundCloudInspector;
        return Promise.race([
          new Promise<WidgetSnapshot>((resolve) =>
            widget.getCurrentSound((track) =>
              widget.getPosition((position) =>
                widget.isPaused((paused) =>
                  resolve({ provider, id: String(track.id), position, paused }),
                ),
              ),
            ),
          ),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('SoundCloud SDK callback stalled')),
              3000,
            ),
          ),
        ]);
      }
      if (provider === 'youtube' && window.YT) {
        const frame = active.querySelector('iframe');
        if (!frame) return null;
        const widget = window.YT.get(frame.id);
        if (widget)
          return {
            provider,
            id: widget.getVideoData().video_id,
            position: widget.getCurrentTime() * 1000,
            paused: widget.getPlayerState() !== 1,
          };
      }
      return null;
    });
  }

  async function playing(track: Track) {
    const deadline = Date.now() + 20_000;
    let first: WidgetSnapshot | null = null;
    let last: WidgetSnapshot | null = null;
    while (Date.now() < deadline) {
      const current = await snapshot().catch(() => null);
      last = current;
      if (
        current?.provider === track.provider &&
        current.id === track.id &&
        !current.paused
      ) {
        first = current;
        break;
      }
      await page.waitForTimeout(250);
    }
    if (!first) {
      console.error(
        'Last SDK state',
        last,
        await page.locator('body').innerText(),
      );
      const element = await page
        .locator('[data-provider][aria-hidden="false"] iframe')
        .elementHandle();
      const frame = await element?.contentFrame();
      if (frame)
        console.error(
          'Provider diagnostics',
          await frame.evaluate(() => ({
            text: document.body.innerText,
            commands: window.providerCommands,
            media: [
              ...window.observedMedia,
              ...document.querySelectorAll<HTMLMediaElement>('audio,video'),
            ].map((media) => ({
              paused: media.paused,
              ready: media.readyState,
              error: media.error?.message,
              position: media.currentTime,
              duration: media.duration,
            })),
          })),
        );
    }
    assert.ok(first, `player did not start ${track.provider}:${track.id}`);
    await expect
      .poll(
        async () => {
          const before = await snapshot();
          await page.waitForTimeout(5000);
          const after = await snapshot();
          console.log('SDK progress window', {
            before,
            after,
            expected: track.id,
          });
          return (
            before?.id === track.id &&
            after?.id === track.id &&
            !before.paused &&
            !after.paused &&
            after.position - before.position > 3500
          );
        },
        {
          timeout: 20_000,
          message:
            'official SDK clock must sustain five seconds of playback after track-load seeking settles',
        },
      )
      .toBe(true);
    const next = await snapshot();
    assert.ok(next);
    const frameElement = await page
      .locator(
        `[data-provider="${track.provider}"][aria-hidden="false"] iframe`,
      )
      .elementHandle();
    const frame = await frameElement?.contentFrame();
    assert.ok(frame, 'official provider iframe must exist');
    const media = await frame.evaluate(() =>
      [
        ...(window.observedMedia || []),
        ...document.querySelectorAll<HTMLMediaElement>('audio,video'),
      ]
        .filter(
          (item) =>
            !item.paused && !item.ended && !item.muted && item.volume > 0,
        )
        .map((item) => ({
          position: item.currentTime,
          ready: item.readyState,
        })),
    );
    await expect
      .poll(
        () =>
          frame.evaluate(async () => {
            const elements = [
              ...new Set([
                ...window.observedMedia,
                ...document.querySelectorAll<HTMLMediaElement>('audio,video'),
              ]),
            ];
            const positions = new Map(
              elements.map((element) => [element, element.currentTime]),
            );
            await new Promise((done) => setTimeout(done, 2000));
            const mediaProgresses = elements.some(
              (element) =>
                !element.paused &&
                !element.ended &&
                !element.muted &&
                element.volume > 0 &&
                element.currentTime - positions.get(element)! > 1.2,
            );
            const audibleOutput = [...window.observedAudioOutputs].some(
              (analyser) => {
                const samples = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(samples);
                return samples.some((sample) => Math.abs(sample) > 0.0001);
              },
            );
            return mediaProgresses || audibleOutput;
          }),
        {
          timeout: 15_000,
          message:
            'actual media must advance unmuted or Web Audio must output a non-silent signal',
        },
      )
      .toBe(true);
    assert.equal(
      await page
        .locator('[data-provider][aria-hidden="false"]')
        .getByRole('button', { name: 'Click to play' })
        .count(),
      0,
    );
    console.log(JSON.stringify({ event: 'verified-playback', ...next, media }));
    await appendFile(
      'test-results/players/live-progress.jsonl',
      `${JSON.stringify({ event: 'verified-playback', ...next, media })}\n`,
    );
  }

  const prompt = page
    .locator('[data-provider][aria-hidden="false"]')
    .getByRole('button', { name: 'Click to play' });
  await page
    .locator('[data-provider][aria-hidden="false"]')
    .waitFor({ timeout: 45_000 });
  await prompt.waitFor({ state: 'visible', timeout: 45_000 });
  await expect
    .poll(async () => (await snapshot().catch(() => null))?.id, {
      timeout: 45_000,
    })
    .toBe(playlist[0]!.id);
  await prompt.click();
  await playing(playlist[0]!);
  const history = await page.evaluate(() => window.history.length);

  // Full cycle covers SC→SC, SC→YT, YT→YT and YT→SC for each trigger.
  for (const trigger of ['skip', 'natural']) {
    for (let index = 0; index < playlist.length; index++) {
      const next = playlist[(index + 1) % playlist.length]!;
      if (trigger === 'skip')
        await page.getByRole('button', { name: 'Skip', exact: true }).click();
      if (trigger === 'natural') {
        const deadline = Date.now() + 420_000;
        let transitioned = false;
        let lastProgress = Date.now();
        let lastPosition = -1;
        while (Date.now() < deadline) {
          const current = await snapshot().catch(() => null);
          if (current?.provider === next.provider && current.id === next.id) {
            transitioned = true;
            break;
          }
          if (current && !current.paused && current.position > lastPosition)
            lastProgress = Date.now();
          if (current) lastPosition = current.position;
          assert.ok(
            Date.now() - lastProgress < 15_000,
            'provider must keep progressing until its natural end',
          );
          await page.waitForTimeout(500);
        }
        assert.ok(
          transitioned,
          'local fixture must advance on the real player end event within seven minutes',
        );
      }
      await playing(next);
      assert.equal(
        await page.evaluate(() => window.history.length),
        history,
        'track changes must not add history entries',
      );
    }
  }
  await mkdir('test-results/players', { recursive: true });
  await page.screenshot({ path: 'test-results/players/live.png' });
});
