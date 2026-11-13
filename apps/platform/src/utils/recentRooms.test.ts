import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readRecentRooms, rememberRecentRoom } from './recentRooms.ts';

const cookie = (value: unknown) =>
  `zoff-recent-rooms-music=${encodeURIComponent(JSON.stringify(value))}`;

test('empty, malformed and oversized cookies have no recent section', () => {
  for (const value of [
    '',
    'zoff-recent-rooms-music=%',
    cookie({}),
    cookie([null, 4, { id: 'x' }]),
    `zoff-recent-rooms-music=${'x'.repeat(3501)}`,
  ]) {
    assert.deepEqual(readRecentRooms(value, 'MUSIC'), []);
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
      'MUSIC',
    ),
    rooms,
  );
});

test('revisiting moves a room first, refreshes its name and retains only three', () => {
  const cookies = new Map<string, string>();
  let lastWrite = '';
  const document = {
    get cookie() {
      return [...cookies.values()].join('; ');
    },
    set cookie(value: string) {
      lastWrite = value;
      const pair = value.split(';')[0];
      cookies.set(pair.split('=')[0], pair);
    },
  };
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
    rememberRecentRoom({ id, name: `Room ${id}` }, 'MUSIC');
  }
  assert.deepEqual(
    readRecentRooms(document.cookie, 'MUSIC').map((room) => room.id),
    ['second', 'fourth', 'third'],
  );
  assert.match(lastWrite, /SameSite=Lax; Secure$/);
  rememberRecentRoom({ id: 'second', name: 'Renamed' }, 'MUSIC');
  assert.equal(readRecentRooms(document.cookie, 'MUSIC')[0]?.name, 'Renamed');
  for (const id of ['movie-one', 'movie-two', 'movie-three', 'movie-four']) {
    rememberRecentRoom({ id, name: id }, 'WATCH');
  }
  assert.deepEqual(
    readRecentRooms(document.cookie, 'MUSIC').map((room) => room.id),
    ['second', 'fourth', 'third'],
  );
  assert.deepEqual(
    readRecentRooms(document.cookie, 'WATCH').map((room) => room.id),
    ['movie-four', 'movie-three', 'movie-two'],
  );

  if (originalDocument)
    Object.defineProperty(globalThis, 'document', originalDocument);
  else Reflect.deleteProperty(globalThis, 'document');
  if (originalLocation)
    Object.defineProperty(globalThis, 'location', originalLocation);
  else Reflect.deleteProperty(globalThis, 'location');
});

test('preserves stored IDs for long encoded Unicode room names', () => {
  const id = 'u6771-u4eac-'.repeat(40);
  assert.deepEqual(readRecentRooms(cookie([{ id, name: '東京' }]), 'MUSIC'), [
    { id, name: '東京' },
  ]);
});
