import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePlaylistItem } from './item.ts';

test('Cast preserves the canonical playlist item contract', () => {
  const item = {
    id: 'queue-entry',
    sourceType: 'youtube' as const,
    sourceId: 'video-id',
    title: 'Track',
    publisher: 'Publisher',
    providerUrl: 'https://www.youtube.com/watch?v=video-id',
    thumbnailUrl: 'https://example.test/thumbnail.webp',
    duration: 120,
    addedAt: '2026-10-17T00:00:00.000Z',
    addedBy: 'listener',
    voteCount: 3,
    playbackRestriction: 'region' as const,
  };

  assert.deepEqual(normalizePlaylistItem(item), item);
  assert.equal('artist' in normalizePlaylistItem(item), false);
});
