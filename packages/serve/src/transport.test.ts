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

test('suffix transport coexists with explicit endpoints on one origin', async (t) => {
  const app = express();
  for (const prefix of ['/admin', '/remotes', '/embed', '']) {
    app.use(
      prefix || '/',
      createRequestHandler({
        entry: `${prefix}/assets/entry.js`,
        dataEndpoint: `${prefix}/_smolter`,
        build: {
          default: () => new Response('document'),
          handleDataRequest: async (request) => {
            if (request.headers.get('cookie') !== 'fixture-session=1') {
              return new Response('Unauthorized', { status: 401 });
            }
            const url = new URL(request.url);
            return Response.json({
              application: prefix || 'platform',
              path: url.pathname,
              tags: url.searchParams.getAll('tag'),
              body: request.method === 'GET' ? '' : await request.text(),
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
  for (const prefix of ['/admin', '/remotes', '/embed', '']) {
    for (const path of [
      `${prefix}/`,
      `${prefix}/users`,
      `${prefix}/users/`,
      `${prefix}/resources/profiles`,
    ]) {
      for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
        const suffix = `${path}.__smolter?tag=first&tag=second`;
        const response = await fetch(`${origin}${suffix}`, {
          method,
          headers: {
            Cookie: 'fixture-session=1',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          ...(method !== 'GET' && { body: 'name=a%26b&name=c' }),
        });
        assert.equal(response.status, 200, suffix);
        assert.equal(
          response.headers.get('cache-control'),
          'private, no-store',
        );
        assert.deepEqual(await response.json(), {
          application: prefix || 'platform',
          path,
          tags: ['first', 'second'],
          body: method === 'GET' ? '' : 'name=a%26b&name=c',
        });
      }
      const unauthorized = await fetch(`${origin}${path}.__smolter`);
      assert.equal(unauthorized.status, 401);
      assert.equal(
        unauthorized.headers.get('cache-control'),
        'private, no-store',
      );
    }
    const document = await fetch(`${origin}${prefix}/users`);
    assert.equal(await document.text(), 'document');
  }
});
