import type { Song } from '@vibes/models';
import { DEFAULT_SONG_THUMBNAIL } from '@vibes/shared';

// Illustrative metadata only. No provider requests or real tracks in product demos.
export const queueDemoSongs: Song[] = [1, 2, 3, 4].map((number) => ({
  id: `demo-${number}`,
  sourceId: '',
  sourceType: 'youtube',
  title: `Song title 0${number}`,
  artist: 'Artist name',
  duration: 210,
  thumbnailUrl: DEFAULT_SONG_THUMBNAIL,
  addedBy: 'Guest',
  addedAt: '2026-09-18T12:00:00Z',
  voteCount: 0,
}));
