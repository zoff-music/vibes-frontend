import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import service from './player-service.cjs';

test('serves only a validated official-player wrapper on loopback', async (t) => {
  const server = service.createPlayerServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${origin}/health`);
  assert.equal(await health.text(), 'Zoff player ready');
  assert.equal(health.headers.get('access-control-allow-origin'), '*');
  for (const route of ['/unknown', '/youtube', '/youtube?video=invalid']) {
    assert.equal((await fetch(`${origin}${route}`)).status, 404);
  }
  assert.equal(
    (await fetch(`${origin}/health`, { method: 'POST' })).status,
    405,
  );

  const player = await fetch(`${origin}/youtube?video=M7lc1UVf-VE&start=-10`);
  assert.equal(
    player.headers.get('referrer-policy'),
    'strict-origin-when-cross-origin',
  );
  const html = await player.text();
  assert.match(html, /https:\/\/www.youtube.com\/embed\/M7lc1UVf-VE\?/);
  assert.match(html, /&amp;start=0/);
  assert.match(
    html,
    /allow="autoplay; encrypted-media; fullscreen; picture-in-picture"/,
  );
  assert.equal(
    (await fetch(`${origin}/youtube?video=M7lc1UVf-VE&video=invalid`)).status,
    404,
  );
});
