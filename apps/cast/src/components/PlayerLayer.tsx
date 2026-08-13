import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useCast } from './CastProvider';

const LazySoundCloudPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/SoundCloudPlayer');
  return { default: module.SoundCloudPlayer };
});

const LazySpotifyPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/SpotifyPlayer');
  return { default: module.SpotifyPlayer };
});

const LazyVideoPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/VideoPlayer');
  return { default: module.VideoPlayer };
});

export const PlayerLayer: React.FC = () => {
  const {
    currentSong,
    enabledProviders,
    queue,
    reportPlaybackFailure,
    spotifyToken,
  } = useCast();
  const preloadYouTubeSong =
    queue.find((song) => song.sourceType === 'youtube') ?? null;
  const preloadSpotifySong =
    queue.find((song) => song.sourceType === 'spotify') ?? null;
  const preloadSoundCloudSong =
    queue.find((song) => song.sourceType === 'soundcloud') ?? null;
  const shouldMountYouTube =
    enabledProviders.includes('youtube') ||
    currentSong?.sourceType === 'youtube';
  const shouldMountSpotify =
    enabledProviders.includes('spotify') ||
    currentSong?.sourceType === 'spotify';
  const shouldMountSoundCloud =
    enabledProviders.includes('soundcloud') ||
    currentSong?.sourceType === 'soundcloud';
  const [hasMountedYouTube, setHasMountedYouTube] =
    useState(shouldMountYouTube);
  const [hasMountedSpotify, setHasMountedSpotify] =
    useState(shouldMountSpotify);
  const [hasMountedSoundCloud, setHasMountedSoundCloud] = useState(
    shouldMountSoundCloud,
  );

  useEffect(() => {
    if (shouldMountYouTube) setHasMountedYouTube(true);
    if (shouldMountSpotify) setHasMountedSpotify(true);
    if (shouldMountSoundCloud) setHasMountedSoundCloud(true);
  }, [shouldMountSoundCloud, shouldMountSpotify, shouldMountYouTube]);
  const handlePlaybackError = useCallback(
    (songId: string) => {
      void reportPlaybackFailure(songId);
    },
    [reportPlaybackFailure],
  );

  return (
    <div className="absolute inset-0 h-full w-full">
      {hasMountedYouTube && (
        <Suspense fallback={null}>
          <LazyVideoPlayer
            isVisible={currentSong?.sourceType === 'youtube'}
            fill
            appContext="cast"
            preloadSong={preloadYouTubeSong}
            onPlaybackError={handlePlaybackError}
          />
        </Suspense>
      )}
      {hasMountedSpotify && (
        <Suspense fallback={null}>
          <LazySpotifyPlayer
            isVisible={currentSong?.sourceType === 'spotify'}
            fill
            accessToken={spotifyToken}
            preloadSong={preloadSpotifySong}
          />
        </Suspense>
      )}
      {hasMountedSoundCloud && (
        <Suspense fallback={null}>
          <LazySoundCloudPlayer
            appContext="cast"
            isVisible={currentSong?.sourceType === 'soundcloud'}
            fill
            preloadSong={preloadSoundCloudSong}
          />
        </Suspense>
      )}
    </div>
  );
};
