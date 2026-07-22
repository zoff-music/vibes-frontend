import { classNames } from '@vibes/shared';
import React from 'react';
import { Button } from '../components/Button';
import {
  CastIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkipIcon,
  SpotifyIcon,
} from '../icons';

interface Props {
  isPlaying: boolean;
  canPlay: boolean;
  canSkip: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkip: () => void;
  onAddSong: () => void;
  onOpenCast: () => void;
  isCasting: boolean;
  castDeviceName?: string | null;
  showSpotifyConnect?: boolean;
  onConnectSpotify?: () => void;
}

const PlayerControlsComponent: React.FC<Props> = ({
  isPlaying,
  canPlay,
  canSkip,
  onPlay,
  onPause,
  onSkip,
  onAddSong,
  onOpenCast,
  isCasting,
  castDeviceName,
  showSpotifyConnect,
  onConnectSpotify,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-4">
        <Button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          variant="primary"
          size="none"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="group h-12 w-12 shrink-0 rounded-2xl border border-primary/60 p-0 text-white shadow-[0_0_24px_rgba(255,46,151,0.45)] hover:shadow-[0_0_30px_rgba(255,46,151,0.6)] active:scale-95"
        >
          {isPlaying && <PauseIcon className="h-6 w-6 fill-current" />}
          {!isPlaying && <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />}
        </Button>

        <Button
          onClick={onSkip}
          disabled={!canSkip}
          variant="tertiary"
          size="icon"
          title="Skip"
        >
          <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
        </Button>

        <Button
          onClick={onOpenCast}
          variant={isCasting ? 'secondary' : 'tertiary'}
          size="icon"
          title={
            isCasting && castDeviceName
              ? `Casting to ${castDeviceName}`
              : 'Cast'
          }
        >
          <CastIcon
            className={classNames(
              'h-5 w-5 transition-colors',
              isCasting && 'text-primary',
              !isCasting && 'text-theme-muted group-hover:text-primary',
            )}
            showDot={isCasting}
          />
        </Button>

        {showSpotifyConnect && onConnectSpotify && (
          <Button
            onClick={onConnectSpotify}
            variant="tertiary"
            className="ml-auto h-12 gap-2 px-4"
            title="Connect Spotify"
          >
            <SpotifyIcon className="h-6 w-6" />
            <span className="whitespace-nowrap font-display text-xs tracking-[0.2em]">
              Connect Spotify
            </span>
          </Button>
        )}

        <Button
          onClick={onAddSong}
          variant="tertiary"
          className="ml-auto h-12 gap-2 px-6"
          title="Add Song"
        >
          <PlusIcon className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap font-display text-theme text-xs tracking-[0.2em]">
            Add Song
          </span>
        </Button>
      </div>
    </div>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
