import type { Song } from '@vibes/models';
import { lazy, memo, Suspense, useEffect, useState } from 'react';

const LazySoundCloudPlayer = lazy(async () => {
  const module = await import('@vibes/ui/player/SoundCloudPlayer');
  return { default: module.SoundCloudPlayer };
});

const LazySpotifyPlayer = lazy(async () => {
  const module = await import('@vibes/ui/player/SpotifyPlayer');
  return { default: module.SpotifyPlayer };
});

const LazyVideoPlayer = lazy(async () => {
  const module = await import('@vibes/ui/player/VideoPlayer');
  return { default: module.VideoPlayer };
});

interface Props {
  currentSong: Song | null;
  enabledProviders: string[];
  requestProviderToken: (
    provider: 'spotify' | 'youtube',
    force?: boolean,
  ) => void;
  spotifyToken: string | null;
  songs: Song[];
  tokenLoading: boolean;
  youtubeToken: string | null;
}

interface LoadedPlayers {
  soundcloud: boolean;
  spotify: boolean;
  youtube: boolean;
}

function PlayerLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-primary" />
    </div>
  );
}

function EmbedPlayerSourceComponent({
  currentSong,
  enabledProviders,
  requestProviderToken,
  spotifyToken,
  songs,
  tokenLoading,
  youtubeToken,
}: Props) {
  const isSoundCloudActive = currentSong?.sourceType === 'soundcloud';
  const isSpotifyActive = currentSong?.sourceType === 'spotify';
  const isYouTubeActive = currentSong?.sourceType === 'youtube';
  const isSoundCloudEnabled = enabledProviders.includes('soundcloud');
  const isSpotifyEnabled = enabledProviders.includes('spotify');
  const isYouTubeEnabled = enabledProviders.includes('youtube');
  const [loadedPlayers, setLoadedPlayers] = useState<LoadedPlayers>(() => ({
    soundcloud: isSoundCloudActive,
    spotify: isSpotifyActive,
    youtube: isYouTubeActive,
  }));

  useEffect(() => {
    setLoadedPlayers((current) => ({
      soundcloud:
        current.soundcloud || isSoundCloudActive || isSoundCloudEnabled,
      spotify: current.spotify || isSpotifyActive || isSpotifyEnabled,
      youtube: current.youtube || isYouTubeActive || isYouTubeEnabled,
    }));
  }, [
    isSoundCloudActive,
    isSoundCloudEnabled,
    isSpotifyActive,
    isSpotifyEnabled,
    isYouTubeActive,
    isYouTubeEnabled,
  ]);

  const shouldMountSoundCloud = loadedPlayers.soundcloud || isSoundCloudActive;
  const shouldMountSpotify = loadedPlayers.spotify || isSpotifyActive;
  const shouldMountYouTube = loadedPlayers.youtube || isYouTubeActive;
  const preloadSoundCloudSong =
    songs.find((song) => song.sourceType === 'soundcloud') ?? null;
  const preloadSpotifySong =
    songs.find((song) => song.sourceType === 'spotify') ?? null;
  const preloadYouTubeSong =
    songs.find((song) => song.sourceType === 'youtube') ?? null;

  return (
    <div className="absolute inset-0">
      {shouldMountYouTube && (
        <Suspense fallback={isYouTubeActive && <PlayerLoading />}>
          <LazyVideoPlayer
            isVisible={isYouTubeActive}
            fill
            appContext="platform"
            isFetchingToken={tokenLoading}
            onRequestToken={requestProviderToken}
            preloadSong={preloadYouTubeSong}
            providerToken={youtubeToken}
          />
        </Suspense>
      )}
      {shouldMountSpotify && (
        <Suspense fallback={isSpotifyActive && <PlayerLoading />}>
          <LazySpotifyPlayer
            isVisible={isSpotifyActive}
            fill
            accessToken={spotifyToken}
            isFetchingToken={tokenLoading}
            onRequestToken={requestProviderToken}
            preloadSong={preloadSpotifySong}
          />
        </Suspense>
      )}
      {shouldMountSoundCloud && (
        <Suspense fallback={isSoundCloudActive && <PlayerLoading />}>
          <LazySoundCloudPlayer
            isVisible={isSoundCloudActive}
            fill
            preloadSong={preloadSoundCloudSong}
          />
        </Suspense>
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
