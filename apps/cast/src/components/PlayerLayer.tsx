import { SoundCloudPlayer } from '@vibes/ui/player/SoundCloudPlayer';
import { SpotifyPlayer } from '@vibes/ui/player/SpotifyPlayer';
import { VideoPlayer } from '@vibes/ui/player/VideoPlayer';
import React from 'react';
import { useCast } from './CastProvider';

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
        <VideoPlayer
          isVisible={currentSong?.sourceType === 'youtube'}
          fill
          appContext="cast"
          preloadSong={preloadYouTubeSong}
        />
      )}
      {shouldMountSpotify && (
        <SpotifyPlayer
          isVisible={currentSong?.sourceType === 'spotify'}
          fill
          accessToken={spotifyToken}
          preloadSong={preloadSpotifySong}
        />
      )}
      {shouldMountSoundCloud && (
        <SoundCloudPlayer
          isVisible={currentSong?.sourceType === 'soundcloud'}
          fill
          preloadSong={preloadSoundCloudSong}
        />
      )}
    </div>
  );
};
