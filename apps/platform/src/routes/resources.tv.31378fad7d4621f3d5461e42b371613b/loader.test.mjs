import assert from 'node:assert/strict';
import test from 'node:test';
import { TV_PLAYER_PATH } from '@vibes/shared/tv-player';

import handle, { routes } from '../../../dist/server/index.js';

// The SSR build imports application stores with background timers, so the
// test command exits after completion rather than waiting for those timers.

const origin = 'https://zoff.me';

test('hosted TV player serves only a static official iframe and a hashed stylesheet', async () => {
  const response = await handle(
    new Request(`${origin}${TV_PLAYER_PATH}?video=M7lc1UVf-VE&start=42`),
  );
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
  );
  assert.equal(
    response.headers.get('referrer-policy'),
    'strict-origin-when-cross-origin',
  );
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.doesNotMatch(
    response.headers.get('content-security-policy'),
    /frame-ancestors/,
  );
  assert.equal(response.headers.get('x-frame-options'), null);
  const html = await response.text();
  assert.match(html, /https:\/\/www.youtube.com\/embed\/M7lc1UVf-VE\?/);
  assert.match(html, /&amp;start=42/);
  assert.match(
    html,
    /allow="autoplay; encrypted-media; fullscreen; picture-in-picture"/,
  );
  assert.match(html, /href="\/assets\/player-[^"/]+\.css"/);
  assert.doesNotMatch(html, /<script|127\.0\.0\.1|localhost|<style/);
});

test('player route rejects invalid or repeated input without reflecting it into HTML', async () => {
  const queries = [
    '',
    '?video=invalid',
    '?video=%22%3E%3Cscript%3E',
    '?video=M7lc1UVf-VE&video=another',
    '?video=M7lc1UVf-VE&start=-1',
    '?video=M7lc1UVf-VE&start=1.5',
    '?video=M7lc1UVf-VE&start=Infinity',
    '?video=M7lc1UVf-VE&start=86401',
    '?video=M7lc1UVf-VE&start=0&start=10',
  ];
  for (const query of queries) {
    const response = await handle(
      new Request(`${origin}${TV_PLAYER_PATH}${query}`),
    );
    assert.equal(response.status, 400, query);
    assert.equal(await response.text(), 'Invalid video ID or start time.');
  }
});

test('player route defaults to the beginning of the video', async () => {
  const response = await handle(
    new Request(`${origin}${TV_PLAYER_PATH}?video=M7lc1UVf-VE`),
  );
  assert.equal(response.status, 200);
  assert.match(await response.text(), /&amp;start=0/);
});

test('robots excludes the resource prefix without advertising the player URL', async () => {
  const response = await handle(new Request(`${origin}/robots.txt`));
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /Disallow: \/resources\//);
  assert(!body.includes(TV_PLAYER_PATH));
  assert(!body.includes('/tv-player'));
});

test('only the unlisted path maps to the player resource', () => {
  const playerRoutes = routes.filter(
    (route) =>
      route.id === 'routes/resources.tv.31378fad7d4621f3d5461e42b371613b/route',
  );
  assert.equal(playerRoutes.length, 1);
  assert.equal(playerRoutes[0].path, TV_PLAYER_PATH);
  assert(!routes.some((route) => route.path === '/tv-player'));
});
