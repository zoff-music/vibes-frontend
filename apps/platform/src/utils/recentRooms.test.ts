import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readRecentRooms, rememberRecentRoom } from './recentRooms.ts';

const cookie = (value: unknown) =>
  `zoff-recent-rooms=${encodeURIComponent(JSON.stringify(value))}`;

test('empty, malformed and oversized cookies have no recent section', () => {
  for (const value of [
    '',
    'zoff-recent-rooms=%',
    cookie({}),
    cookie([null, 4, { id: 'x' }]),
    `zoff-recent-rooms=${'x'.repeat(3501)}`,
  ]) {
    assert.deepEqual(readRecentRooms(value), []);
  }
});

test('keeps the three newest distinct valid rooms, including unicode names', () => {
  const rooms = [
    { id: 'private-room', name: '私たちの部屋' },
    { id: 'public-room', name: 'Public room' },
    { id: 'watch-room', name: 'Movie night' },
  ];
  assert.deepEqual(
    readRecentRooms(
      `theme=dark; ${cookie([rooms[0], rooms[0], {}, ...rooms.slice(1), { id: 'older', name: 'Older' }])}; other=1`,
    ),
    rooms,
  );
});

test('revisiting moves a room first, refreshes its name and retains only three', () => {
  const document = { cookie: '' };
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  );
  const originalLocation = Object.getOwnPropertyDescriptor(
    globalThis,
    'location',
  );
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: document,
  });
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { protocol: 'https:' },
  });
  for (const id of ['first', 'second', 'third', 'fourth', 'second']) {
    rememberRecentRoom({ id, name: `Room ${id}` });
  }
  assert.deepEqual(
    readRecentRooms(document.cookie).map((room) => room.id),
    ['second', 'fourth', 'third'],
  );
  assert.match(document.cookie, /SameSite=Lax; Secure$/);
  rememberRecentRoom({ id: 'second', name: 'Renamed' });
  assert.equal(readRecentRooms(document.cookie)[0]?.name, 'Renamed');
  if (originalDocument)
    Object.defineProperty(globalThis, 'document', originalDocument);
  else Reflect.deleteProperty(globalThis, 'document');
  if (originalLocation)
    Object.defineProperty(globalThis, 'location', originalLocation);
  else Reflect.deleteProperty(globalThis, 'location');
});

test('preserves stored IDs for long encoded Unicode room names', () => {
  const id = 'u6771-u4eac-'.repeat(40);
  assert.deepEqual(readRecentRooms(cookie([{ id, name: '東京' }])), [
    { id, name: '東京' },
  ]);
});
