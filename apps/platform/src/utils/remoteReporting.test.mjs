import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const result = await build({
  stdin: {
    contents: `export { subscribeRemoteReports } from './remoteReporting.ts';
      export { usePlaybackStore } from '@vibes/shared';`,
    resolveDir: fileURLToPath(new URL('.', import.meta.url)),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
});
const { subscribeRemoteReports, usePlaybackStore } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);

test('remote reports are change-driven, coalesced and cleaned up', async () => {
  globalThis.window = new EventTarget();
  const reports = [];
  let release;
  const stop = subscribeRemoteReports(async () => {
    reports.push(usePlaybackStore.getState().positionMs);
    await new Promise((resolve) => {
      release = resolve;
    });
  });

  await setImmediate();
  assert.equal(reports.length, 1, 'initial synchronization');
  usePlaybackStore.setState({ actualPositionMs: 5000 });
  await setImmediate();
  assert.equal(reports.length, 1, 'clock ticks do not report');

  usePlaybackStore.setState({ positionMs: 1000 });
  usePlaybackStore.setState({ positionMs: 2000 });
  await setImmediate();
  assert.equal(reports.length, 1, 'only one request in flight');
  release();
  await setImmediate();
  assert.deepEqual(reports, [0, 2000], 'latest pending state wins');
  release();
  await setImmediate();

  window.dispatchEvent(new Event('online'));
  await setImmediate();
  assert.equal(reports.length, 3, 'network recovery resynchronizes');
  usePlaybackStore.setState({ resetVersion: 1 });
  stop();
  release();
  window.dispatchEvent(new Event('online'));
  usePlaybackStore.setState({ isPlaying: true });
  await setImmediate();
  assert.equal(reports.length, 3, 'cleanup cancels queued work and listeners');
  delete globalThis.window;
});
