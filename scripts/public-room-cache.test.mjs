import assert from 'node:assert/strict';
import test from 'node:test';
import { createPublicRequestCache } from '../packages/api/src/requests/cache.ts';

test('public room results are isolated by mode and expire after ten seconds', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const read = createPublicRequestCache(10_000);
  let calls = 0;
  const load = async () => [null, ++calls];

  assert.deepEqual(await read('origin:MUSIC', load), [null, 1]);
  assert.deepEqual(await read('origin:MUSIC', load), [null, 1]);
  assert.deepEqual(await read('origin:WATCH', load), [null, 2]);
  assert.deepEqual(await read('other-origin:MUSIC', load), [null, 3]);
  t.mock.timers.tick(10_000);
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
  let complete;
  let calls = 0;
  const load = () => {
    calls += 1;
    return new Promise((resolve) => {
      complete = resolve;
    });
  };
  const first = read('MUSIC', load, controller.signal);
  const second = read('MUSIC', load);

  controller.abort();
  complete([null, []]);
  assert.equal((await first)[0].name, 'AbortError');
  assert.deepEqual(await second, [null, []]);
  assert.equal(calls, 1);
});
