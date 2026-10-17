import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({
  stdin: {
    contents: `export { api, apiV3, createApiClientWithBaseUrl } from './packages/api/src/client';
      export { getAPIErrorMessage } from './packages/api/src/rateLimit';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const { api, apiV3, createApiClientWithBaseUrl, getAPIErrorMessage } =
  await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`
  );
const clients = [api, apiV3];

after(() => {
  for (const client of clients) {
    client.dispose();
    client.v2?.dispose();
    client.v3?.dispose();
  }
});

test('API validates and transforms requests before sending, then strips response extras', async () => {
  const requests = [];
  const client = createApiClientWithBaseUrl('https://fixture.invalid', {
    fetcher: async (request) => {
      requests.push(await request.json());
      return Response.json({ name: 'Listener', ignored: true });
    },
  });

  clients.push(client);

  const [error, profile] = await client.patch(
    '/sessions',
    {},
    { name: ' Listener ', ignored: true },
    { retry: 0 },
  );
  assert.equal(error, null);
  assert.deepEqual(requests, [{ name: 'Listener' }]);
  assert.deepEqual(profile, { name: 'Listener' });

  const [invalid] = await client.patch(
    '/sessions',
    {},
    { name: ' ' },
    { retry: 0 },
  );
  assert(invalid);
  assert.equal(requests.length, 1);
});

test('API preserves response defaults and rejects malformed responses', async () => {
  let response = { enabled: true, online: true };
  const client = createApiClientWithBaseUrl('https://fixture.invalid', {
    fetcher: async () => Response.json(response),
  });

  clients.push(client);

  const [error, remote] = await client.v2.get('/remotes', {}, { retry: 0 });
  assert.equal(error, null);
  assert.equal(remote.playbackIsPlaying, false);
  assert.equal(remote.currentRoomId, '');
  assert.equal(remote.playbackPositionMs, 0);

  response = { enabled: 'yes', online: true };
  const [invalid, data] = await client.v2.get('/remotes', {}, { retry: 0 });
  assert(invalid);
  assert.equal(data, null);
});

test('API error envelopes still expose propagated backend messages', async () => {
  const client = createApiClientWithBaseUrl('https://fixture.invalid', {
    fetcher: async () =>
      Response.json(
        {
          namespace: 'room',
          error: 'denied',
          message: 'Not allowed.',
          propagate: true,
        },
        { status: 403 },
      ),
  });

  clients.push(client);

  const [error] = await client.get('/sessions', {}, { retry: 0 });
  assert(error);
  assert.equal(await getAPIErrorMessage(error), 'Not allowed.');
});
