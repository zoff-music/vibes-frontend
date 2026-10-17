import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { createRequestHandler } from '@kasperrt/smolter/utils/http';
import express from 'express';

test('route data is private and uncacheable for reads, mutations and errors', async (t) => {
  const app = express();
  for (const prefix of ['/admin', '/remotes', '/embed', '']) {
    app.use(
      prefix || '/',
      createRequestHandler({
        dataEndpoint: `${prefix}/_smolter`,
        entry: '/entry.js',
        build: {
          default: () => new Response('document'),
          handleDataRequest: (request) => {
            const status = Number(
              new URL(request.url).searchParams.get('status') || 200,
            );

            return new Response(null, {
              status,
              headers: {
                'Cache-Control': 'public, max-age=3600',
                ...(status === 303 && { Location: `${prefix}/login` }),
              },
            });
          },
        },
      }),
    );
  }
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  for (const prefix of ['', '/admin', '/remotes', '/embed']) {
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
      for (const status of [200, 303, 400, 401, 500]) {
        const response = await fetch(
          `${origin}${prefix}/_smolter?url=${encodeURIComponent(`/resources/root?status=${status}`)}`,
          {
            method,
            redirect: 'manual',
          },
        );

        assert.equal(
          response.headers.get('cache-control'),
          'private, no-store',
        );
        assert.equal(response.status, status);
      }
    }
    const invalid = await fetch(
      `${origin}${prefix}/_smolter?url=https://invalid.example`,
    );

    assert.equal(invalid.status, 400);
    assert.equal(invalid.headers.get('cache-control'), 'private, no-store');
  }

  const asset = await fetch(`${origin}/assets/example.js`);

  assert.equal(asset.headers.get('cache-control'), null);
});
