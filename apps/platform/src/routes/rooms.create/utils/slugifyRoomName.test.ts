import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchRoutes } from '@kasperrt/smolter/utils';
import { redirect } from '@kasperrt/smolter/utils/responses';
import { slugifyRoomName } from './slugifyRoomName.ts';

test('kanji', () => {
  const slug = slugifyRoomName('東京 音楽');
  assert.equal(slug, 'u6771-u4eac-u20-u97f3-u697d');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('mixed scripts', () => {
  const slug = slugifyRoomName('Tokyo 東京 ２０２６');
  assert.equal(
    slug,
    'u54-u6f-u6b-u79-u6f-u20-u6771-u4eac-u20-uff12-uff10-uff12-uff16',
  );
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('kana', () => {
  const slug = slugifyRoomName('かな カタカナ');
  assert.equal(slug, 'u304b-u306a-u20-u30ab-u30bf-u30ab-u30ca');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('combining marks', () => {
  const slug = slugifyRoomName('Café 音楽');
  assert.equal(slug, 'u43-u61-u66-u65-u301-u20-u97f3-u697d');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('trimmed unicode', () => {
  const slug = slugifyRoomName('  東京 音楽  ');
  assert.equal(slug, 'u6771-u4eac-u20-u97f3-u697d');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('ascii compatibility', () => {
  const slug = slugifyRoomName(' --My  Room---42! ');
  assert.equal(slug, 'my-room-42');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('unsafe URL characters', () => {
  const slug = slugifyRoomName('東京/?#% 音楽');
  assert.equal(slug, 'u6771-u4eac-u2f-u3f-u23-u25-u20-u97f3-u697d');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('emoji display name', () => {
  const slug = slugifyRoomName('🎵');
  assert.equal(slug, 'u1f3b5');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});
test('only ASCII symbols', () => {
  const slug = slugifyRoomName('/?#%');
  assert.equal(slug, '');
  assert.equal(slugifyRoomName(slug), slug);
  assert.match(slug, /^[a-z0-9-]*$/);
  assert.equal(encodeURIComponent(slug), slug);
});

test('generated IDs round-trip through redirects without percent encoding', () => {
  const slug = slugifyRoomName('東京 音楽');
  const response = redirect(`/${encodeURIComponent(slug)}`);
  const location = response.headers.get('Location');
  assert.equal(location, `/${slug}`);
  assert.ok(!location?.includes('%'));
  const url = new URL(location ?? '', 'https://example.com');
  assert.equal(url.search, '');
  assert.equal(url.hash, '');
  assert.equal(matchRoutes([{ path: '/:id' }], url.pathname)?.params.id, slug);
  assert.notEqual(slugifyRoomName('東京 映画'), slug);
});

test('Unicode IDs retain every code point without collisions from boundaries', () => {
  for (const name of ['東', '東京 音楽', '🎵', 'A東']) {
    const id = slugifyRoomName(name);
    const decoded = id
      .split('-')
      .map((part) => String.fromCodePoint(Number.parseInt(part.slice(1), 16)))
      .join('');
    assert.equal(decoded, name);
  }
  assert.equal(slugifyRoomName('東'), 'u6771');
});

test('existing ASCII room IDs remain unchanged regardless of the display name', () => {
  const storedRoom = { id: 'dmen-8', name: 'dümen-8' };
  assert.equal(slugifyRoomName(storedRoom.id), storedRoom.id);
  assert.notEqual(slugifyRoomName(storedRoom.name), storedRoom.id);
  const url = new URL(`/${storedRoom.id}`, 'https://example.com');
  assert.equal(url.pathname, '/dmen-8');
  assert.equal(
    matchRoutes([{ path: '/:id' }], url.pathname)?.params.id,
    storedRoom.id,
  );
});
