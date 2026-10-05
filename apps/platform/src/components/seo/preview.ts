import type { PlaylistItem } from '@vibes/models';
import { DEFAULT_PLAYLIST_ITEM_THUMBNAIL } from '@vibes/shared';

// Illustrative metadata only. No provider requests or real tracks in product demos.
export const queueDemoPlaylistItems: PlaylistItem[] = [1, 2, 3, 4].map(
  (number) => ({
    id: `demo-${number}`,
    sourceId: '',
    sourceType: 'youtube',
    title: `Song title 0${number}`,
    publisher: 'Artist name',
    duration: 210,
    thumbnailUrl: DEFAULT_PLAYLIST_ITEM_THUMBNAIL,
    addedBy: 'Guest',
    addedAt: '2026-09-18T12:00:00Z',
    voteCount: 0,
  }),
);
