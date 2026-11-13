import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectRoomDiscoveryTab } from './roomDiscovery.ts';

test('defaults to public when rooms exist, otherwise recent when history exists', () => {
  assert.equal(selectRoomDiscoveryTab('', true, true, 'MUSIC'), 'public');
  assert.equal(selectRoomDiscoveryTab('', true, false, 'MUSIC'), 'recent');
  assert.equal(selectRoomDiscoveryTab('', false, false, 'MUSIC'), 'public');
});

test('explicit selections survive reloads even when the chosen list is empty', () => {
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab-music=public', true, false, 'MUSIC'),
    'public',
  );
  assert.equal(
    selectRoomDiscoveryTab(
      'theme=dark; zoff-room-tab-music=recent',
      true,
      true,
      'MUSIC',
    ),
    'recent',
  );
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab-music=recent', false, true, 'MUSIC'),
    'public',
  );
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab-music=invalid', true, false, 'MUSIC'),
    'recent',
  );
});

test('Music and Watch read only their own saved selection', () => {
  const cookie = 'zoff-room-tab-music=recent; zoff-room-tab-watch=public';
  assert.equal(selectRoomDiscoveryTab(cookie, true, true, 'MUSIC'), 'recent');
  assert.equal(selectRoomDiscoveryTab(cookie, true, false, 'WATCH'), 'public');
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab-music=recent', true, true, 'WATCH'),
    'public',
  );
});
