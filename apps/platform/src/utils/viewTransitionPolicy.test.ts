import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldTransitionPage } from './viewTransitionPolicy.ts';

function page(pathname: string, path = pathname) {
  return { url: `https://zoff.me${pathname}`, path, params: {} };
}

test('page changes animate but URL-only changes remain still', () => {
  assert.equal(shouldTransitionPage(page('/'), page('/discovery/apps')), true);
  assert.equal(
    shouldTransitionPage(page('/privacy-policy'), page('/security')),
    true,
  );
  assert.equal(
    shouldTransitionPage(
      page('/rooms/explore'),
      page('/rooms/explore?type=watch'),
    ),
    false,
  );
  assert.equal(
    shouldTransitionPage(
      page('/features/music'),
      page('/features/music#explore-zoff'),
    ),
    false,
  );
  assert.equal(
    shouldTransitionPage(page('/discovery/apps'), page('/discovery/apps')),
    false,
  );
});

test('home scenes and device settings retain their own animations', () => {
  assert.equal(shouldTransitionPage(page('/'), page('/features/watch')), false);
  assert.equal(
    shouldTransitionPage(page('/features/watch'), page('/features/music')),
    false,
  );
  assert.equal(
    shouldTransitionPage(page('/'), page('/settings/device')),
    false,
  );
  assert.equal(
    shouldTransitionPage(
      page('/features/watch/settings/device'),
      page('/features/watch'),
    ),
    false,
  );
  assert.equal(
    shouldTransitionPage(page('/discovery/apps'), page('/settings/device')),
    true,
  );
});

test('room entry and exit animate while same-room panels stay live', () => {
  assert.equal(
    shouldTransitionPage(
      page('/electro', '/:id/*'),
      page('/electro/chat', '/:id/*'),
    ),
    false,
  );
  assert.equal(
    shouldTransitionPage(page('/electro', '/:id/*'), page('/features/music')),
    true,
  );
  assert.equal(
    shouldTransitionPage(page('/features/music'), page('/electro', '/:id/*')),
    true,
  );
});
