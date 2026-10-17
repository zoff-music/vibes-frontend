import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { createRequestHandler } from '@kasperrt/smolter/utils/http';
import express from 'express';

test('path-hosted applications retain their data endpoint and mutation body', async (t) => {
  const app = express();

  for (const prefix of ['/admin', '/remotes', '/embed', '']) {
    app.use(
      prefix || '/',
      createRequestHandler({
        entry: `${prefix}/assets/entry.js`,
        dataEndpoint: `${prefix}/_smolter`,
        build: {
          default: () => new Response('document'),
          handleDataRequest: async (request) =>
            Response.json({
              application: prefix || 'platform',
              path: new URL(request.url).pathname,
              method: request.method,
              body: request.method !== 'GET' ? await request.text() : '',
            }),
        },
      }),
    );
  }

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  for (const prefix of ['/admin', '/remotes', '/embed', '']) {
    for (const method of ['GET', 'POST', 'PATCH']) {
      const response = await fetch(
        `${origin}${prefix}/_smolter?url=${prefix}/test`,
        {
          method,
          ...(method !== 'GET' && { body: 'intent=test' }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      assert.deepEqual(await response.json(), {
        application: prefix || 'platform',
        path: `${prefix}/test`,
        method,
        body: method === 'GET' ? '' : 'intent=test',
      });
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
    }
  }
});
