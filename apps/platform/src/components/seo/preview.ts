import type { PlaylistItem } from '@vibes/models';
import musicNight from '../../assets/product/music-night.svg?no-inline';
import musicStreetlight from '../../assets/product/music-streetlight.svg?no-inline';
import musicTrain from '../../assets/product/music-train.svg?no-inline';
import musicVelvet from '../../assets/product/music-velvet.svg?no-inline';
import musicWarmup from '../../assets/product/music-warmup.svg?no-inline';
import watchFilm from '../../assets/product/watch-film.svg?no-inline';
import watchNight from '../../assets/product/watch-night.svg?no-inline';
import watchSpace from '../../assets/product/watch-space.svg?no-inline';

// Illustrative metadata only. No provider requests or real tracks in product demos.
export const queueDemoPlaylistItems: PlaylistItem[] = [1, 2, 3, 4].map(
  (number) => ({
    id: `demo-${number}`,
    sourceId: '',
    sourceType: number === 2 ? 'soundcloud' : 'youtube',
    title: [
      'Velvet keys',
      'Streetlight swing',
      'After the last train',
      'One more night',
    ][number - 1],
    publisher: 'Zoff preview',
    duration: 210,
    thumbnailUrl: [musicVelvet, musicStreetlight, musicTrain, musicNight][
      number - 1
    ],
    addedBy: ['Mira', 'Alex', 'Lou', 'Alex'][number - 1],
    addedAt: `2026-09-18T12:00:0${number}Z`,
    voteCount: 0,
  }),
);

export const watchDemoPlaylistItems: PlaylistItem[] =
  queueDemoPlaylistItems.map((item, index) => ({
    ...item,
    sourceType: 'youtube',
    title: [
      'Beyond the city lights',
      'A little further out',
      'Nowhere to rush',
      'The long way home',
    ][index],
    publisher: 'Preview film',
    thumbnailUrl: [watchNight, watchSpace, watchFilm, watchNight][index],
    duration: [480, 360, 720, 540][index],
  }));

export const queueDemoOpeningArtwork = musicWarmup;
