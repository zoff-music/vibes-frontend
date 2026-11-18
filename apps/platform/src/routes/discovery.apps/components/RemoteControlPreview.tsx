import type { PlaylistItem } from '@vibes/shared';
import {
  Button,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  SkipIcon,
} from '@vibes/ui/web';
import type { Ref } from 'preact/compat';

interface RemoteControlPreviewProps {
  playlistItem: PlaylistItem;
  playing: boolean;
  durationMs: number;
  position: number;
  playButtonRef: Ref<HTMLButtonElement>;
  onTogglePlayback: () => void;
  onSkip: () => void;
  onSeek: (position: number) => void;
}

export function RemoteControlPreview({
  playlistItem,
  playing,
  durationMs,
  position,
  playButtonRef,
  onTogglePlayback,
  onSkip,
  onSeek,
}: RemoteControlPreviewProps) {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="font-pixel text-2xs text-theme-muted tracking-label">
        Now playing
      </p>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={playlistItem.thumbnailUrl}
          alt=""
          width={80}
          height={80}
          decoding="async"
          className="border-theme bg-theme-surface size-16 shrink-0 rounded-xl border object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-theme line-clamp-2 text-base">
            {playlistItem.title}
          </h3>
          <p className="text-theme-muted mt-1 truncate text-sm">
            {playlistItem.publisher}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button
          ref={playButtonRef}
          size="icon"
          variant="secondary"
          aria-label={playing ? 'Pause from remote' : 'Play from remote'}
          onClick={onTogglePlayback}
        >
          {playing && <PauseIcon aria-hidden="true" className="h-5 w-5" />}
          {!playing && <PlayIcon aria-hidden="true" className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant="tertiary"
          aria-label="Skip from remote"
          onClick={onSkip}
        >
          <SkipIcon aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-5">
        <PlaybackProgress
          disabled={false}
          durationMs={durationMs}
          positionMs={position}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
        />
      </div>
    </div>
  );
}
