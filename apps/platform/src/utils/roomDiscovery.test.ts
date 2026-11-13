import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectRoomDiscoveryTab } from './roomDiscovery.ts';

test('defaults to public when rooms exist, otherwise recent when history exists', () => {
  assert.equal(selectRoomDiscoveryTab('', true, true), 'public');
  assert.equal(selectRoomDiscoveryTab('', true, false), 'recent');
  assert.equal(selectRoomDiscoveryTab('', false, false), 'public');
});

test('explicit selections survive reloads even when the chosen list is empty', () => {
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab=public', true, false),
    'public',
  );
  assert.equal(
    selectRoomDiscoveryTab('theme=dark; zoff-room-tab=recent', true, true),
    'recent',
  );
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab=recent', false, true),
    'public',
  );
  assert.equal(
    selectRoomDiscoveryTab('zoff-room-tab=invalid', true, false),
    'recent',
  );
});
