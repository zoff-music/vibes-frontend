import type { Song } from '@vibes/models';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface EmbedPlayerCardProps {
  autoplay: boolean;
  currentSong: Song | null;
  durationMs: number;
  positionMs: number;
}

export function EmbedPlayerCard({
  autoplay,
  currentSong,
  durationMs,
  positionMs,
}: EmbedPlayerCardProps) {
  return (
    <div className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
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
        <EmbedPlayerSource autoplay={autoplay} currentSong={currentSong} />
      </div>

      <div className="mt-3 min-w-0">
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
          className="mt-3 h-1.5 w-full cursor-default accent-primary"
          max={durationMs || 1}
          value={Math.min(positionMs, durationMs)}
        />
      </div>
    </div>
  );
}
