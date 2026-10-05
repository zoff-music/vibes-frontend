import type { PlaylistItem } from '@vibes/models';
import { resolvePlaylistItemThumbnail } from '@vibes/shared';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { EmbedPlayerSource } from './player-source';
import { EmbedSourceIcon } from './source-icon';

interface Props {
  autoplay: boolean;
  currentPlaylistItem: PlaylistItem | null;
  durationMs: number;
  enabledProviders: string[];
  onLocalAlignmentChange: (isAligned: boolean) => void;
  onLocalInteraction: () => void;
  onNeedsUserGestureChange: (needsGesture: boolean) => void;
  onStartPlayback: () => void;
  positionMs: number;
  playlistItems: PlaylistItem[];
}

export function EmbedPlayerCard({
  autoplay,
  currentPlaylistItem,
  durationMs,
  enabledProviders,
  onLocalAlignmentChange,
  onLocalInteraction,
  onNeedsUserGestureChange,
  onStartPlayback,
  positionMs,
  playlistItems,
}: Props) {
  const { boundedPositionMs, progress } = getPlaybackPresentation(
    positionMs,
    durationMs,
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        {currentPlaylistItem && (
          <img
            src={resolvePlaylistItemThumbnail(currentPlaylistItem.thumbnailUrl)}
            alt=""
            className="h-full w-full object-cover opacity-75"
          />
        )}
        {!currentPlaylistItem && (
          <div className="flex h-full items-center justify-center text-theme-muted text-xs">
            Nothing playing
          </div>
        )}
        <EmbedPlayerSource
          autoplay={autoplay}
          currentPlaylistItem={currentPlaylistItem}
          enabledProviders={enabledProviders}
          onLocalAlignmentChange={onLocalAlignmentChange}
          onLocalInteraction={onLocalInteraction}
          onNeedsUserGestureChange={onNeedsUserGestureChange}
          onLocalPlay={onStartPlayback}
          playlistItems={playlistItems}
        />
      </div>

      <div className="mt-3 min-w-0 shrink-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-pixel text-sm text-theme">
              {currentPlaylistItem?.title ?? 'Waiting for music'}
            </h1>
            <p className="mt-1 truncate text-theme-muted text-xs">
              {currentPlaylistItem?.publisher ?? 'The room queue is ready'}
            </p>
          </div>
          <EmbedSourceIcon currentPlaylistItem={currentPlaylistItem} />
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
