import type { Song } from '@vibes/models';
import { resolveSongThumbnail } from '@vibes/shared';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface Props {
  autoplay: boolean;
  currentSong: Song | null;
  durationMs: number;
  enabledProviders: string[];
  onLocalAlignmentChange: (isAligned: boolean) => void;
  onLocalInteraction: () => void;
  onNeedsUserGestureChange: (needsGesture: boolean) => void;
  onStartPlayback: () => void;
  positionMs: number;
  songs: Song[];
}

export function EmbedPlayerCard({
  autoplay,
  currentSong,
  durationMs,
  enabledProviders,
  onLocalAlignmentChange,
  onLocalInteraction,
  onNeedsUserGestureChange,
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
          autoplay={autoplay}
          currentSong={currentSong}
          enabledProviders={enabledProviders}
          onLocalAlignmentChange={onLocalAlignmentChange}
          onLocalInteraction={onLocalInteraction}
          onNeedsUserGestureChange={onNeedsUserGestureChange}
          onLocalPlay={onStartPlayback}
          songs={songs}
        />
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
