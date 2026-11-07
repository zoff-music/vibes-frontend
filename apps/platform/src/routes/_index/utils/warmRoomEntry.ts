import { safeWrapAsync } from '@vibes/shared';

const YOUTUBE_ORIGINS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://i.ytimg.com',
];

let warmed = false;

/**
 * A visitor focusing or typing into the room field is about to open a room. Fetch the room view and
 * player code, open YouTube's connections and load its small iframe API now, so the room renders and
 * its player starts as soon as they press Enter. Nothing here plays media or opens room streams.
 */
export function warmRoomEntry() {
  if (warmed || typeof document === 'undefined') return;

  warmed = true;

  for (const origin of YOUTUBE_ORIGINS) {
    if (
      document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)
    ) {
      continue;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    document.head.append(link);
  }

  void safeWrapAsync(import('../../$id.$/components/RoomView'));
  void safeWrapAsync(
    import('@vibes/ui/web/player/VideoPlayer').then(({ preloadYouTubeApi }) =>
      preloadYouTubeApi(),
    ),
  );
}
