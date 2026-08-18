import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useCast } from './CastProvider';

const LazySoundCloudPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/SoundCloudPlayer');
  return { default: module.SoundCloudPlayer };
});

const LazyVideoPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/VideoPlayer');
  return { default: module.VideoPlayer };
});

export const PlayerLayer: React.FC = () => {
  const { currentSong, enabledProviders, queue, reportPlaybackFailure } =
    useCast();
  const preloadYouTubeSong =
    queue.find((song) => song.sourceType === 'youtube') ?? null;
  const preloadSoundCloudSong =
    queue.find((song) => song.sourceType === 'soundcloud') ?? null;
  const shouldMountYouTube =
    enabledProviders.includes('youtube') ||
    currentSong?.sourceType === 'youtube';
  const shouldMountSoundCloud =
    enabledProviders.includes('soundcloud') ||
    currentSong?.sourceType === 'soundcloud';
  const [hasMountedYouTube, setHasMountedYouTube] =
    useState(shouldMountYouTube);
  const [hasMountedSoundCloud, setHasMountedSoundCloud] = useState(
    shouldMountSoundCloud,
  );

  useEffect(() => {
    if (shouldMountYouTube) setHasMountedYouTube(true);
    if (shouldMountSoundCloud) setHasMountedSoundCloud(true);
  }, [shouldMountSoundCloud, shouldMountYouTube]);
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
