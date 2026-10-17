import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { TV_PLAYER_PATH } from '@vibes/shared/tv-player';
import express from 'express';
import { createFrameProtectionMiddleware } from './middleware.ts';

test('file framing exception is exact and does not weaken other website routes', async (t) => {
  const app = express();
  app.use(
    createFrameProtectionMiddleware({
      fileAllowedPath: TV_PLAYER_PATH,
      allowedPath: '/embed',
    }),
  );
  app.use((_request, response) => {
    response.send('ok');
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    server.close();
  });
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  for (const path of [TV_PLAYER_PATH, `${TV_PLAYER_PATH}/`]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.headers.get('content-security-policy'), null);
    assert.equal(response.headers.get('x-frame-options'), null);
  }

  for (const path of [
    '/',
    '/room-name',
    '/tv-player',
    '/resources/tv',
    '/resources/tv/incorrect',
    `${TV_PLAYER_PATH}/other`,
    `${TV_PLAYER_PATH}-other`,
  ]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(
      response.headers.get('content-security-policy'),
      "frame-ancestors 'none'",
    );
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
  }

  const embed = await fetch(`${origin}/embed/room`);
  assert.equal(
    embed.headers.get('content-security-policy'),
    'frame-ancestors *',
  );
  assert.equal(embed.headers.get('x-frame-options'), null);
});
