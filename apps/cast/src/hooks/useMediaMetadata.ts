import type { PlaylistItem } from '@vibes/shared';
import { resolvePlaylistItemThumbnail, safeWrap } from '@vibes/shared';
import type { framework } from 'chromecast-caf-receiver';
import { useCallback } from 'react';

interface ExtendedPlayerManager extends framework.PlayerManager {
  broadcastStatus(includeMediaStatus: boolean): void;
}

export function useMediaMetadata() {
  const updateMediaMetadata = useCallback((playlistItem: PlaylistItem) => {
    if (!window.cast?.framework) return;

    const context = window.cast.framework.CastReceiverContext.getInstance();
    const playerManager = context.getPlayerManager();
    if (!playerManager) return;

    const [err] = safeWrap(() => {
      const mediaInfo =
        playerManager.getMediaInformation() ||
        new cast.framework.messages.MediaInformation();

      const metadata = new cast.framework.messages.MusicTrackMediaMetadata();
      metadata.title = playlistItem.title;
      metadata.artist = playlistItem.publisher || 'Unknown Artist';
      metadata.images = [
        new cast.framework.messages.Image(
          resolvePlaylistItemThumbnail(playlistItem.thumbnailUrl),
        ),
      ];

      mediaInfo.metadata = metadata;
      mediaInfo.contentId = playlistItem.id; // Or sourceId
      mediaInfo.contentType = 'audio/mpeg'; // Generic content type
      mediaInfo.streamType = cast.framework.messages.StreamType.BUFFERED;
      mediaInfo.duration = playlistItem.duration || 0;

      playerManager.setMediaInformation(mediaInfo);

      // Force a status broadcast
      (playerManager as ExtendedPlayerManager).broadcastStatus?.(true);
    });

    if (err) {
      // Logging removed as requested
    }
  }, []);

  return updateMediaMetadata;
}
