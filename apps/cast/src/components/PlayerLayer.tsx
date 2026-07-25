import { SoundCloudPlayer } from '@vibes/ui/player/SoundCloudPlayer';
import { SpotifyPlayer } from '@vibes/ui/player/SpotifyPlayer';
import { VideoPlayer } from '@vibes/ui/player/VideoPlayer';
import React from 'react';
import { useCast } from './CastProvider';

export const PlayerLayer: React.FC = () => {
  const { currentSong, spotifyToken } = useCast();

  return (
    <div className="absolute inset-0 h-full w-full">
      <VideoPlayer
        isVisible={currentSong?.sourceType === 'youtube'}
        fill
        appContext="cast"
      />
      <SpotifyPlayer
        isVisible={currentSong?.sourceType === 'spotify'}
        fill
        accessToken={spotifyToken}
      />
      <SoundCloudPlayer
        isVisible={currentSong?.sourceType === 'soundcloud'}
        fill
      />
    </div>
  );
};
