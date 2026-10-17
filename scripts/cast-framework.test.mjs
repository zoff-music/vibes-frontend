import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

test('Cast framework owns discovery, resume, disconnect and listener cleanup', async () => {
  const listeners = new Map();
  const messages = new Set();
  let session = null;
  let requests = 0;
  let muted = true;
  let options;
  const rawSession = {
    sessionId: 'session',
    receiver: { label: 'device', friendlyName: 'Living room' },
    addMessageListener: (_namespace, listener) => messages.add(listener),
    removeMessageListener: (_namespace, listener) => messages.delete(listener),
  };
  const cafSession = {
    getSessionObj: () => rawSession,
    setMute: async (value) => {
      muted = value;
    },
  };
  const context = {
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      assert.equal(listeners.get(type), listener);
      listeners.delete(type);
    },
    setOptions: (value) => {
      options = value;
    },
    getCastState: () => 'available',
    getCurrentSession: () => session,
    requestSession: async () => {
      requests++;
      session = cafSession;
      listeners.get('session')({ sessionState: 'started' });
    },
    endCurrentSession: (stop) => {
      assert.equal(stop, true);
      session = null;
      listeners.get('session')?.({ sessionState: 'ended' });
    },
  };
  const savedWindow = globalThis.window;
  const savedCast = globalThis.cast;
  const savedChrome = globalThis.chrome;
  globalThis.chrome = {
    cast: { AutoJoinPolicy: { TAB_AND_ORIGIN_SCOPED: 'origin' } },
  };
  globalThis.window = { chrome: globalThis.chrome };
  globalThis.cast = {
    framework: {
      CastContext: { getInstance: () => context },
      CastContextEventType: {
        CAST_STATE_CHANGED: 'cast',
        SESSION_STATE_CHANGED: 'session',
      },
      CastState: { NO_DEVICES_AVAILABLE: 'unavailable' },
      SessionState: {
        SESSION_STARTED: 'started',
        SESSION_RESUMED: 'resumed',
        SESSION_ENDED: 'ended',
      },
    },
  };

  const result = await build({
    entryPoints: ['apps/platform/src/services/cast/CastManager.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    plugins: [
      {
        name: 'cast-fixture',
        setup(builder) {
          builder.onResolve(
            { filter: /^(@vibes\/shared.*|\.\/constants|\.\/LocalEmulator)$/ },
            ({ path }) => ({ path, namespace: 'fixture' }),
          );
          builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => {
            let contents = '';
            if (path === './constants')
              contents = `export const CAST_APPLICATION_ID='app', CAST_DEVICE_PICKER_ID='picker', CUSTOM_RECEIVER_URL='', DEVELOPMENT_MODE=false, LOCAL_EMULATOR_ENABLED=false;`;
            else if (path === './LocalEmulator')
              contents = `export class LocalEmulator { isLocalEmulator() { return false; } destroy() {} }`;
            else
              contents = `export { safeWrap, safeWrapAsync } from ${JSON.stringify(resolve('packages/shared/src/wrap.ts'))};
          export const browserDebugLog=()=>{}, isBrowserDebugEnabled=()=>false;
          export const useRoomStore={getState:()=>({})}, useThemeStore={getState:()=>({resolvedTheme:'dark'})};`;
            return { contents, resolveDir: process.cwd() };
          });
        },
      },
    ],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
  const { castManager } = await import(`data:text/javascript;base64,${source}`);
  const states = [];
  castManager.onSessionStateChange((value) => states.push(value.state));

  assert.equal((await castManager.discoverDevices())[0].id, 'picker');
  assert.equal(options.resumeSavedSession, true);
  assert.equal(
    (await castManager.connectToDevice('picker')).deviceId,
    'device',
  );
  assert.equal(requests, 1);
  assert.equal(muted, false);
  assert.equal(messages.size, 1);
  listeners.get('session')({ sessionState: 'resumed' });
  assert.equal(messages.size, 1);
  await castManager.disconnectFromDevice('device');
  assert.equal(messages.size, 0);
  assert.deepEqual(states, ['connected', 'disconnected']);
  castManager.destroy();
  assert.equal(listeners.size, 0);

  globalThis.window = savedWindow;
  globalThis.cast = savedCast;
  globalThis.chrome = savedChrome;
});
