import type { PlaylistItem } from '@vibes/models';
import { DEFAULT_PLAYLIST_ITEM_THUMBNAIL } from '@vibes/shared';
import watchFilm from '../../assets/product/watch-film.svg?no-inline';
import watchNight from '../../assets/product/watch-night.svg?no-inline';
import watchSpace from '../../assets/product/watch-space.svg?no-inline';

// Illustrative metadata only. No provider requests or real tracks in product demos.
export const queueDemoPlaylistItems: PlaylistItem[] = [1, 2, 3, 4].map(
  (number) => ({
    id: `demo-${number}`,
    sourceId: '',
    sourceType: 'youtube',
    title: [
      'Velvet keys',
      'Streetlight swing',
      'After the last train',
      'One more night',
    ][number - 1],
    publisher: 'Zoff preview',
    duration: 210,
    thumbnailUrl: DEFAULT_PLAYLIST_ITEM_THUMBNAIL,
    addedBy: 'Guest',
    addedAt: '2026-09-18T12:00:00Z',
    voteCount: 0,
  }),
);

export const watchDemoPlaylistItems: PlaylistItem[] = queueDemoPlaylistItems
  .slice(0, 3)
  .map((item, index) => ({
    ...item,
    title: [
      'Beyond the city lights',
      'A little further out',
      'Nowhere to rush',
    ][index],
    publisher: 'Preview film',
    thumbnailUrl: [watchNight, watchSpace, watchFilm][index],
    duration: [480, 360, 720][index],
  }));
