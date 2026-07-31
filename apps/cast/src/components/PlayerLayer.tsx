import React, { lazy, Suspense } from 'react';
import { useCast } from './CastProvider';

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

export const PlayerLayer: React.FC = () => {
  const { currentSong, enabledProviders, queue, spotifyToken } = useCast();
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

  return (
    <div className="absolute inset-0 h-full w-full">
      {shouldMountYouTube && (
        <Suspense fallback={null}>
          <LazyVideoPlayer
            isVisible={currentSong?.sourceType === 'youtube'}
            fill
            appContext="cast"
            preloadSong={preloadYouTubeSong}
          />
        </Suspense>
      )}
      {shouldMountSpotify && (
        <Suspense fallback={null}>
          <LazySpotifyPlayer
            isVisible={currentSong?.sourceType === 'spotify'}
            fill
            accessToken={spotifyToken}
            preloadSong={preloadSpotifySong}
          />
        </Suspense>
      )}
      {shouldMountSoundCloud && (
        <Suspense fallback={null}>
          <LazySoundCloudPlayer
            isVisible={currentSong?.sourceType === 'soundcloud'}
            fill
            preloadSong={preloadSoundCloudSong}
          />
        </Suspense>
      )}
    </div>
  );
};
