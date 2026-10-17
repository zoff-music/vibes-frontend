import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

const result = await build({
  stdin: {
    contents: `export { updateRoomSession } from './apps/mobile/src/requests/update-room-session';
      export { state } from 'fixture';`,
    resolveDir: process.cwd(),
  },
  alias: {
    '@/lib/storage-keys': resolve('apps/mobile/src/lib/storage-keys.ts'),
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  plugins: [
    {
      name: 'room-session-fixture',
      setup(builder) {
        builder.onResolve(
          { filter: /^(fixture|@vibes\/api|@\/lib\/(api|secure-storage))$/ },
          () => ({ path: 'fixture', namespace: 'fixture' }),
        );
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
          contents: `
        export const state = { hasPassword: false, password: 'old-password', status: 0, joins: 0, deleted: [], saved: [] };
        const room = () => ({ id: 'electro', hasPassword: state.hasPassword, isAdmin: false });
        export const mobileApi = {};
        export const getHttpError = error => ({ response: { status: error.status } });
        export const getRequestErrorMessage = async (_error, fallback) => fallback;
        export const createRoomReadRequests = () => ({
          fetchRoom: async () => [null, room()],
          fetchPlaylistItems: async () => [null, []],
        });
        export const createRoomPlaybackRequests = () => ({ fetchPlayback: async () => [null, {}] });
        export const createRoomLifecycleRequests = () => ({
          joinRoom: async () => {
            state.joins++;
            return state.status ? [{ status: state.status }, null] : [null, { room: room() }];
          },
        });
        export const getSecureValue = async () => [null, state.password];
        export const deleteSecureValue = async key => { state.deleted.push(key); return [null]; };
        export const setSecureValue = async (key, value) => { state.saved.push([key, value]); return [null]; };
      `,
        }));
      },
    },
  ],
});
const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
const { updateRoomSession, state } = await import(
  `data:text/javascript;base64,${source}`
);
const adminKey = 'zoff.mobile.room-admin.65-6c-65-63-74-72-6f';

test('room opening distinguishes obsolete credentials from transient failures', async () => {
  for (const scenario of [
    {
      hasPassword: false,
      password: 'old-password',
      status: 403,
      joins: 0,
      removed: true,
      warning: false,
    },
    {
      hasPassword: false,
      password: '',
      status: 0,
      joins: 0,
      removed: false,
      warning: false,
    },
    {
      hasPassword: true,
      password: '',
      status: 0,
      joins: 0,
      removed: false,
      warning: false,
    },
    {
      hasPassword: true,
      password: 'valid',
      status: 0,
      joins: 1,
      removed: false,
      warning: false,
    },
    {
      hasPassword: true,
      password: 'invalid',
      status: 403,
      joins: 1,
      removed: true,
      warning: true,
    },
    {
      hasPassword: true,
      password: 'saved',
      status: 503,
      joins: 1,
      removed: false,
      warning: true,
    },
    {
      hasPassword: true,
      password: 'saved',
      status: 429,
      joins: 1,
      removed: false,
      warning: true,
    },
  ]) {
    Object.assign(state, { ...scenario, joins: 0, deleted: [], saved: [] });
    const result = await updateRoomSession({
      input: { intent: 'open' },
      params: { id: 'electro' },
      signal: new AbortController().signal,
    });

    assert.equal(result.data.intent, 'joined');
    assert.equal(result.error, '');
    assert.equal(state.joins, scenario.joins);
    assert.equal(state.deleted.includes(adminKey), scenario.removed);
    assert.equal(Boolean(result.data.warning), scenario.warning);

    if (scenario.status >= 429 && scenario.hasPassword) {
      assert.doesNotMatch(result.data.warning, /not accepted|rejected/);
    }
  }
});

test('explicit rejected admin authentication still fails without deleting saved credentials', async () => {
  Object.assign(state, {
    hasPassword: true,
    password: 'saved',
    status: 403,
    joins: 0,
    deleted: [],
    saved: [],
  });
  const result = await updateRoomSession({
    input: { intent: 'open', password: 'wrong' },
    params: { id: 'electro' },
    signal: new AbortController().signal,
  });

  assert.equal(result.data, null);
  assert.match(result.error, /authenticate/);
  assert.equal(state.deleted.includes(adminKey), false);
});
