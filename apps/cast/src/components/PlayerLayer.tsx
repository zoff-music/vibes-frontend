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
  const {
    currentPlaylistItem,
    enabledProviders,
    queue,
    reportPlaybackFailure,
  } = useCast();
  const preloadYouTubePlaylistItem =
    queue.find((playlistItem) => playlistItem.sourceType === 'youtube') ?? null;
  const preloadSoundCloudPlaylistItem =
    queue.find((playlistItem) => playlistItem.sourceType === 'soundcloud') ??
    null;
  const shouldMountYouTube =
    enabledProviders.includes('youtube') ||
    currentPlaylistItem?.sourceType === 'youtube';
  const shouldMountSoundCloud =
    enabledProviders.includes('soundcloud') ||
    currentPlaylistItem?.sourceType === 'soundcloud';
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
    (playlistItemId: string) => {
      void reportPlaybackFailure(playlistItemId);
    },
    [reportPlaybackFailure],
  );

  return (
    <div className="absolute inset-0 h-full w-full">
      {hasMountedYouTube && (
        <Suspense fallback={null}>
          <LazyVideoPlayer
            isVisible={currentPlaylistItem?.sourceType === 'youtube'}
            fill
            appContext="cast"
            preloadPlaylistItem={preloadYouTubePlaylistItem}
            onPlaybackError={handlePlaybackError}
          />
        </Suspense>
      )}
      {hasMountedSoundCloud && (
        <Suspense fallback={null}>
          <LazySoundCloudPlayer
            appContext="cast"
            isVisible={currentPlaylistItem?.sourceType === 'soundcloud'}
            fill
            preloadPlaylistItem={preloadSoundCloudPlaylistItem}
          />
        </Suspense>
      )}
    </div>
  );
};
