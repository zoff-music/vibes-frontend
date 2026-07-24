import type { Song } from '@vibes/models';
import { SoundCloudPlayer, SpotifyPlayer, VideoPlayer } from '@vibes/ui';
import { memo } from 'react';

interface Props {
  currentSong: Song | null;
  requestProviderToken: (
    provider: 'spotify' | 'youtube',
    force?: boolean,
  ) => void;
  spotifyToken: string | null;
  tokenLoading: boolean;
  youtubeToken: string | null;
}

function EmbedPlayerSourceComponent({
  currentSong,
  requestProviderToken,
  spotifyToken,
  tokenLoading,
  youtubeToken,
}: Props) {
  if (!currentSong) return null;

  return (
    <div className="absolute inset-0">
      {currentSong.sourceType === 'youtube' && (
        <VideoPlayer
          isVisible
          fill
          appContext="platform"
          isFetchingToken={tokenLoading}
          onRequestToken={requestProviderToken}
          providerToken={youtubeToken}
        />
      )}
      {currentSong.sourceType === 'spotify' && (
        <SpotifyPlayer
          isVisible
          fill
          accessToken={spotifyToken}
          isFetchingToken={tokenLoading}
          onRequestToken={requestProviderToken}
        />
      )}
      {currentSong.sourceType === 'soundcloud' && (
        <SoundCloudPlayer isVisible fill />
      )}
    </div>
  );
}

export const EmbedPlayerSource = memo(
  EmbedPlayerSourceComponent,
  (previous, next) =>
    previous.currentSong?.sourceType === next.currentSong?.sourceType &&
    previous.currentSong?.sourceId === next.currentSong?.sourceId &&
    previous.spotifyToken === next.spotifyToken &&
    previous.tokenLoading === next.tokenLoading &&
    previous.youtubeToken === next.youtubeToken,
);
