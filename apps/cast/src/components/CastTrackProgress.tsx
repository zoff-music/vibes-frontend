import type { Song } from '@vibes/shared';
import { usePlaybackStore } from '@vibes/shared';

interface Props {
  song: Song;
}

export function CastTrackProgress({ song }: Props) {
  const actualPositionMs = usePlaybackStore((state) => state.actualPositionMs);

  return (
    <div className="cast-track-progress mt-4">
      <div className="mb-2 flex justify-between font-mono text-sm text-white/60">
        <span>
          {Math.floor(actualPositionMs / 60000)}:
          {String(Math.floor((actualPositionMs / 1000) % 60)).padStart(2, '0')}
        </span>
        <span>
          {Math.floor((song.duration || 0) / 60)}:
          {String(Math.floor((song.duration || 0) % 60)).padStart(2, '0')}
        </span>
      </div>
      <progress
        aria-label="Playback progress"
        className="h-2 w-full appearance-none overflow-hidden rounded-full bg-white/20 [&::-moz-progress-bar]:bg-secondary [&::-webkit-progress-bar]:bg-white/20 [&::-webkit-progress-value]:bg-secondary"
        max={(song.duration || 1) * 1000}
        value={Math.min(actualPositionMs, (song.duration || 1) * 1000)}
      />
    </div>
  );
}
