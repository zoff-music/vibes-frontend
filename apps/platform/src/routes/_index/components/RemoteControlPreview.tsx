import type { Song } from '@vibes/shared';
import {
  Button,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  SkipIcon,
} from '@vibes/ui/web';
import type { Ref } from 'react';

interface RemoteControlPreviewProps {
  song: Song;
  playing: boolean;
  durationMs: number;
  position: number;
  playButtonRef: Ref<HTMLButtonElement>;
  onTogglePlayback: () => void;
  onSkip: () => void;
  onSeek: (position: number) => void;
}

export function RemoteControlPreview({
  song,
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
      <p className="font-pixel text-theme-muted text-xs">Controlling electro</p>
      <h3 className="mt-3 truncate font-display text-base text-theme">
        {song.title}
      </h3>
      <p className="mt-1 text-sm text-theme-muted">{song.artist}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          ref={playButtonRef}
          variant="secondary"
          size="small"
          className="min-h-12 gap-2 text-sm"
          aria-label={playing ? 'Pause from remote' : 'Play from remote'}
          onClick={onTogglePlayback}
        >
          {playing && <PauseIcon aria-hidden="true" className="h-5 w-5" />}
          {!playing && <PlayIcon aria-hidden="true" className="h-5 w-5" />}
          <span>{playing ? 'Pause' : 'Play'}</span>
        </Button>
        <Button
          variant="tertiary"
          size="small"
          className="min-h-12 gap-2 text-sm"
          aria-label="Skip from remote"
          onClick={onSkip}
        >
          <SkipIcon aria-hidden="true" className="h-5 w-5" />
          <span>Skip</span>
        </Button>
      </div>
      <div className="mt-3">
        <PlaybackProgress
          size="comfortable"
          disabled={false}
          durationMs={durationMs}
          positionMs={position}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
        />
      </div>
    </div>
  );
}
