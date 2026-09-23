import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canOfferRoomReminder,
  isInternalDeparture,
} from './roomReminderNavigation.ts';

const origin = 'https://zoff.me';

test('offers a reminder on a new visit or return from another site', () => {
  assert.equal(
    canOfferRoomReminder({ origin, navigationType: 'navigate', referrer: '' }),
    true,
  );
  assert.equal(
    canOfferRoomReminder({
      origin,
      navigationType: 'navigate',
      referrer: 'https://example.com/',
    }),
    true,
  );
});

test('suppresses browser Back and same-site document navigation', () => {
  assert.equal(
    canOfferRoomReminder({
      origin,
      navigationType: 'back_forward',
      referrer: '',
    }),
    false,
  );
  for (const path of ['/electro', '/discovery/listening', '/explore/rooms']) {
    assert.equal(
      canOfferRoomReminder({
        origin,
        navigationType: 'navigate',
        referrer: `${origin}${path}`,
      }),
      false,
    );
  }
});

test('allows refreshing a reminder already shown on the homepage', () => {
  assert.equal(
    canOfferRoomReminder({
      origin,
      navigationType: 'reload',
      referrer: `${origin}/`,
    }),
    true,
  );
});

test('same-site page changes clear the reminder; external links and room anchors do not', () => {
  const roomUrl = `${origin}/electro`;
  for (const path of ['/', '/another-room', '/discovery/apps']) {
    assert.equal(isInternalDeparture(roomUrl, path), true);
  }
  assert.equal(isInternalDeparture(roomUrl, '#queue'), false);
  assert.equal(isInternalDeparture(roomUrl, '?view=party'), false);
  assert.equal(isInternalDeparture(roomUrl, 'https://example.com/'), false);
});
