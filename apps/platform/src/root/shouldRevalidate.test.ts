import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldRevalidate as homeRevalidates } from '../routes/_index/shouldRevalidate.ts';
import { shouldRevalidate } from './shouldRevalidate.ts';

test('profile mutations refresh root data, not homepage discovery', () => {
  const url = new URL('http://localhost/');

  for (const formAction of [
    '/resources/profile',
    'http://localhost/resources/profile',
  ]) {
    const args = {
      url,
      currentUrl: url,
      nextUrl: url,
      formAction,
      formMethod: 'POST',
      defaultShouldRevalidate: true,
      reason: 'action' as const,
    };

    assert.equal(shouldRevalidate(args), true);
    assert.equal(homeRevalidates(args), false);
    assert.equal(shouldRevalidate({ ...args, formAction: '/other' }), false);
  }
});
