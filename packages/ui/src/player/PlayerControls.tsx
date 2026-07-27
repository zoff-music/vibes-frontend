import { classNames } from '@vibes/shared';
import React from 'react';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import {
  CastIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  SkipIcon,
  SpotifyIcon,
} from '../icons';

interface Props {
  isPlaying: boolean;
  canPlay: boolean;
  canSkip: boolean;
  showReset: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
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
  showReset,
  onPlay,
  onPause,
  onReset,
  onSkip,
  onAddSong,
  onOpenCast,
  isCasting,
  castDeviceName,
  showSpotifyConnect,
  onConnectSpotify,
}) => {
  const playbackLabel = isPlaying ? 'Pause' : 'Play';

  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-4">
        <Tooltip className="inline-flex" content={playbackLabel}>
          <Button
            onClick={isPlaying ? onPause : onPlay}
            disabled={!canPlay}
            variant="tertiary"
            size="none"
            aria-label={playbackLabel}
            className="group h-12 w-12 shrink-0 rounded-2xl p-0 active:scale-95"
          >
            {isPlaying && <PauseIcon className="h-6 w-6 fill-current" />}
            {!isPlaying && <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />}
          </Button>
        </Tooltip>

        <Tooltip className="inline-flex" content="Skip">
          <Button
            onClick={onSkip}
            disabled={!canSkip}
            variant="tertiary"
            size="icon"
            aria-label="Skip"
          >
            <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
          </Button>
        </Tooltip>

        {showReset && (
          <Tooltip className="inline-flex" content="Reset playback">
            <Button
              onClick={onReset}
              variant="tertiary"
              size="icon"
              aria-label="Reset playback"
            >
              <ResetIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
            </Button>
          </Tooltip>
        )}

        <Tooltip
          className="inline-flex"
          content={
            isCasting && castDeviceName
              ? `Casting to ${castDeviceName}`
              : 'Cast'
          }
        >
          <Button
            onClick={onOpenCast}
            variant={isCasting ? 'secondary' : 'tertiary'}
            size="icon"
            aria-label={
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
        </Tooltip>

        {showSpotifyConnect && onConnectSpotify && (
          <Button
            onClick={onConnectSpotify}
            variant="tertiary"
            className="ml-auto h-12 gap-2 px-4"
            title="Connect Spotify"
          >
            <SpotifyIcon className="h-6 w-6" />
            <span className="whitespace-nowrap font-display text-xs tracking-display">
              Connect Spotify
            </span>
          </Button>
        )}

        <Button
          onClick={onAddSong}
          variant="primary"
          className="ml-auto h-12 gap-2 px-6"
          title="Add Song"
        >
          <PlusIcon className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap font-display text-xs tracking-display">
            Add Song
          </span>
        </Button>
      </div>
    </div>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
