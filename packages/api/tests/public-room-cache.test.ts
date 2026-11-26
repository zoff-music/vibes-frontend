import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { createPublicRequestCache } from '../src/requests/cache.ts';

test('public room results are isolated by mode and expire after ten seconds', async (_t) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(1000);
  const read = createPublicRequestCache(10_000);
  let calls = 0;
  const load = async (): Promise<[null, number]> => [null, ++calls];

  assert.deepEqual(await read('origin:MUSIC', load), [null, 1]);
  assert.deepEqual(await read('origin:MUSIC', load), [null, 1]);
  assert.deepEqual(await read('origin:WATCH', load), [null, 2]);
  assert.deepEqual(await read('other-origin:MUSIC', load), [null, 3]);
  vi.setSystemTime(11_000);
  assert.deepEqual(await read('origin:MUSIC', load), [null, 4]);
});

test('failed public room reads are not cached', async () => {
  const read = createPublicRequestCache(10_000);
  const error = new Error('unavailable');

  assert.deepEqual(await read('MUSIC', async () => [error, null]), [
    error,
    null,
  ]);
  assert.deepEqual(await read('MUSIC', async () => [null, []]), [null, []]);
});

test('concurrent readers share work without sharing cancellation', async () => {
  const read = createPublicRequestCache(10_000);
  const controller = new AbortController();
  let complete: (value: [null, never[]]) => void = () => {};
  let calls = 0;
  const load = () => {
    calls += 1;
    return new Promise<[null, never[]]>((resolve) => {
      complete = resolve;
    });
  };
  const first = read('MUSIC', load, controller.signal);
  const second = read('MUSIC', load);

  controller.abort();
  complete([null, []]);
  assert.equal((await first)[0]?.name, 'AbortError');
  assert.deepEqual(await second, [null, []]);
  assert.equal(calls, 1);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test('a completed search leaves its HTTP error body readable', async () => {
  const read = createPublicRequestCache(0);
  const [error] = await read('query', async (signal) => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(signal.reason));
        controller.enqueue(new TextEncoder().encode('quota exhausted'));
        controller.close();
      },
    });
    return [
      Object.assign(new Error('search failed'), {
        response: new Response(body),
      }),
      null,
    ];
  });
  assert.ok(error && 'response' in error && error.response instanceof Response);
  assert.equal(await error.response.text(), 'quota exhausted');
});
