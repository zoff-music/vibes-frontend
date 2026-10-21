import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mediaSessionPosition } from '../src/hooks/mediaSessionPosition.ts';

test('uses real track duration and converts playback milliseconds to seconds', () => {
  assert.deepEqual(mediaSessionPosition(213, 42500), {
    duration: 213,
    playbackRate: 1,
    position: 42.5,
  });
});
test('bounds stale or invalid playback positions to the track', () => {
  assert.equal(mediaSessionPosition(213, 999000)?.position, 213);
  assert.equal(mediaSessionPosition(213, -1000)?.position, 0);
  assert.equal(mediaSessionPosition(213, Number.NaN)?.position, 0);
});
test('clears position state for missing or invalid durations', () => {
  for (const duration of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(mediaSessionPosition(duration, 1000), undefined);
  }
});
