import type { Song } from '@vibes/models';
import { SoundCloudPlayer, SpotifyPlayer, VideoPlayer } from '@vibes/player';

interface Props {
  currentSong: Song | null;
}

export function EmbedPlayerSource({ currentSong }: Props) {
  if (!currentSong) return null;

  return (
    <div className="absolute inset-0">
      {currentSong.sourceType === 'youtube' && (
        <VideoPlayer isVisible fill appContext="platform" />
      )}
      {currentSong.sourceType === 'spotify' && <SpotifyPlayer isVisible fill />}
      {currentSong.sourceType === 'soundcloud' && (
        <SoundCloudPlayer isVisible fill />
      )}
    </div>
  );
}
