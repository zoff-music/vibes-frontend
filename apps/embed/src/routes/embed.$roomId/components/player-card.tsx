import type { Song } from '@vibes/models';
import { Button, SkipIcon } from '@vibes/ui';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface Props {
  autoplay: boolean;
  canSkip: boolean;
  currentSong: Song | null;
  durationMs: number;
  onSkip: () => void;
  positionMs: number;
  showSkip: boolean;
}

export function EmbedPlayerCard({
  autoplay,
  canSkip,
  currentSong,
  durationMs,
  onSkip,
  positionMs,
  showSkip,
}: Props) {
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
        {showSkip && (
          <div className="mt-3 flex justify-end">
            <Button
              disabled={!canSkip}
              onClick={onSkip}
              title={canSkip ? 'Skip' : 'Skipping is unavailable'}
              variant="tertiary"
              size="icon"
            >
              <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
