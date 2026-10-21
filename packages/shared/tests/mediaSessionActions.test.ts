import assert from 'node:assert/strict';
import { test } from 'node:test';
import { configureMediaSessionActions } from '../src/hooks/mediaSessionActions.ts';

test('previous feedback does not skip and next survives re-registration without seeking', () => {
  const handlers = new Map<
    MediaSessionAction,
    MediaSessionActionHandler | null
  >();
  let skips = 0;
  let notices = 0;
  const actions = {
    play: () => {},
    pause: () => {},
    next: () => {
      skips += 1;
    },
    previous: () => {
      notices += 1;
    },
  };
  const register = () =>
    configureMediaSessionActions((action, handler) => {
      handlers.set(action, handler);
    }, actions);
  register();
  handlers.get('previoustrack')?.({ action: 'previoustrack' });
  assert.equal(notices, 1);
  assert.equal(skips, 0);
  register();
  handlers.get('nexttrack')?.({ action: 'nexttrack' });
  assert.equal(skips, 1);
  for (const action of ['seekto', 'seekforward', 'seekbackward'] as const) {
    assert.equal(handlers.get(action), null);
  }
  configureMediaSessionActions(
    (action, handler) => {
      handlers.set(action, handler);
    },
    { ...actions, next: null },
  );
  assert.equal(handlers.get('nexttrack'), null);
});
