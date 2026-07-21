import type { Song } from '@vibes/models';
import { SoundCloudPlayer, SpotifyPlayer, VideoPlayer } from '@vibes/ui';

interface Props {
  autoplay: boolean;
  currentSong: Song | null;
}

export function EmbedPlayerSource({ autoplay, currentSong }: Props) {
  if (!autoplay || !currentSong) return null;

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
