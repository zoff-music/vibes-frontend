import type { Song } from '@vibes/models';
import { resolveSongThumbnail } from '@vibes/shared';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { ClickToPlayOverlay } from '@vibes/ui/web';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface Props {
  currentSong: Song | null;
  durationMs: number;
  enabledProviders: string[];
  hasLocalPlayerInteraction: boolean;
  onLocalAlignmentChange: (isAligned: boolean) => void;
  onLocalInteraction: () => void;
  onStartPlayback: () => void;
  positionMs: number;
  songs: Song[];
}

export function EmbedPlayerCard({
  currentSong,
  durationMs,
  enabledProviders,
  hasLocalPlayerInteraction,
  onLocalAlignmentChange,
  onLocalInteraction,
  onStartPlayback,
  positionMs,
  songs,
}: Props) {
  const { boundedPositionMs, progress } = getPlaybackPresentation(
    positionMs,
    durationMs,
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        {currentSong && (
          <img
            src={resolveSongThumbnail(currentSong.thumbnailUrl)}
            alt=""
            className="h-full w-full object-cover opacity-75"
          />
        )}
        {!currentSong && (
          <div className="flex h-full items-center justify-center text-theme-muted text-xs">
            Nothing playing
          </div>
        )}
        <EmbedPlayerSource
          currentSong={currentSong}
          enabledProviders={enabledProviders}
          onLocalAlignmentChange={onLocalAlignmentChange}
          onLocalInteraction={onLocalInteraction}
          onLocalPlay={onStartPlayback}
          songs={songs}
        />
        {currentSong &&
          currentSong.sourceType !== 'youtube' &&
          !hasLocalPlayerInteraction && (
            <ClickToPlayOverlay onClick={onStartPlayback} />
          )}
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
        <div className="mt-1 flex justify-between font-mono text-2xs text-theme-subtle">
          <span>{formatPlaybackMilliseconds(boundedPositionMs)}</span>
          <span>{formatPlaybackMilliseconds(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
