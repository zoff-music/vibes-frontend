import assert from 'node:assert/strict';
import test from 'node:test';
import { routes } from '../dist/server/index.js';

for (const path of [
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
  '/.well-known/security.txt',
  '/resources/tv/31378fad7d4621f3d5461e42b371613b',
]) {
  test(`production discovery preserves ${path}`, () => {
    const matches = routes.filter((route) => route.path === path);

    assert.equal(matches.length, 1);
    assert.equal(typeof matches[0].loader, 'function');
    assert.equal(matches[0].routePath, undefined);
  });
}

test('file routes need no explicit IDs and retain room patterns', () => {
  assert.ok(routes.every((route) => route.id === undefined));
  assert.ok(routes.some((route) => route.path === '/:id'));
  assert.ok(routes.some((route) => route.path === '/rooms/:id'));
  assert.ok(routes.some((route) => route.path === '/features/:experience'));
});

test('shared recents and remotes resources are inferred without UI or aliases', () => {
  for (const [path, handler] of [
    ['/resources/recents', 'clientLoader'],
    ['/resources/remotes', 'clientAction'],
  ]) {
    const matches = routes.filter((route) => route.path === path);

    assert.equal(matches.length, 1);
    assert.equal(typeof matches[0][handler], 'function');
    assert.equal(matches[0].routePath, undefined);
    assert.equal(matches[0].id, undefined);
    assert.equal(matches[0].Component, undefined);
    assert.equal(matches[0].component, undefined);
  }

  assert.ok(!routes.some((route) => route.path === '/remote-control'));
  assert.ok(!routes.some((route) => route.path === '/resources/room-reminder'));
});
