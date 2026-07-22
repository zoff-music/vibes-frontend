import type { Song } from '@vibes/models';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface Props {
  currentSong: Song | null;
  durationMs: number;
  positionMs: number;
}

export function EmbedPlayerCard({
  currentSong,
  durationMs,
  positionMs,
}: Props) {
  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        {currentSong ? (
          <img
            src={currentSong.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover opacity-75"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-theme-muted text-xs">
            Nothing playing
          </div>
        )}
        <EmbedPlayerSource currentSong={currentSong} />
      </div>

      <div className="mt-3 min-w-0 shrink-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-pixel text-sm text-theme">
              {currentSong?.title ?? 'Waiting for music'}
            </h1>
            <p className="mt-1 truncate text-theme-muted text-xs">
              {currentSong?.artist ?? 'The room queue is ready'}
            </p>
          </div>
          <EmbedSourceIcon currentSong={currentSong} />
        </div>
        <progress
          aria-label="Playback progress"
          className="progress-bar mt-3 h-1 w-full"
          max={1}
          value={Math.min(progress, 1)}
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-theme-subtle">
          <span>{formatTime(positionMs)}</span>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
