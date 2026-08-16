import { classNames } from '@vibes/shared';
import { motion } from 'framer-motion';
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
  VolumeIcon,
  VolumeMutedIcon,
} from '../icons';

interface Props {
  isPlaying: boolean;
  canPlay: boolean;
  canSkip: boolean;
  isSkipping?: boolean;
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
  mobileTrailingContent?: React.ReactNode;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMuted: () => void;
}

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMuted: () => void;
}

const VolumeControl = ({
  volume,
  onVolumeChange,
  onToggleMuted,
}: VolumeControlProps) => {
  return (
    <div className="flex h-12 w-28 shrink-0 items-center gap-2 sm:w-44">
      <Button
        aria-label={volume === 0 ? 'Unmute player' : 'Mute player'}
        className="group h-12 w-12 shrink-0 rounded-2xl p-0"
        onClick={onToggleMuted}
        size="none"
        variant="tertiary"
      >
        {volume === 0 && (
          <VolumeMutedIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
        )}
        {volume > 0 && (
          <VolumeIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
        )}
      </Button>
      <div className="relative h-5 min-w-0 flex-1 touch-none select-none">
        <div className="absolute inset-x-0 top-2 h-1 overflow-hidden rounded-full bg-theme-muted/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent"
            style={{ width: `${volume}%` }}
          />
        </div>
        <input
          aria-label="Player volume"
          aria-valuetext={`${volume} percent`}
          className="absolute inset-x-0 top-0 h-5 w-full cursor-pointer touch-none select-none appearance-none bg-transparent [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-primary"
          max="100"
          min="0"
          onInput={(event) => onVolumeChange(Number(event.currentTarget.value))}
          type="range"
          value={volume}
        />
      </div>
      <span className="hidden w-7 text-right font-display text-2xs text-theme-muted tabular-nums sm:block">
        {volume}
      </span>
    </div>
  );
};

const PlayerControlsComponent: React.FC<Props> = ({
  isPlaying,
  canPlay,
  canSkip,
  isSkipping = false,
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
  mobileTrailingContent,
  volume,
  onVolumeChange,
  onToggleMuted,
}) => {
  const playbackLabel = isPlaying ? 'Pause' : 'Play';

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-start gap-2 sm:flex-nowrap sm:gap-4">
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

        <Tooltip
          className="inline-flex"
          content={isSkipping ? 'Skipping song…' : 'Skip'}
        >
          <motion.div
            animate={isSkipping ? { x: [0, 5, -2, 0] } : { x: 0 }}
            transition={{ duration: 0.38 }}
          >
            <Button
              onClick={onSkip}
              disabled={!canSkip || isSkipping}
              variant="tertiary"
              size="icon"
              aria-label={isSkipping ? 'Skipping song' : 'Skip'}
              aria-busy={isSkipping}
              className={classNames(
                'group',
                isSkipping &&
                  'border-primary/60 bg-primary/15 shadow-secondary-soft',
              )}
            >
              <motion.span
                animate={
                  isSkipping
                    ? { opacity: [1, 0.45, 1], x: [0, 4, 0] }
                    : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.38 }}
              >
                <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
              </motion.span>
            </Button>
          </motion.div>
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

        <div className="sm:hidden">
          <VolumeControl
            volume={volume}
            onVolumeChange={onVolumeChange}
            onToggleMuted={onToggleMuted}
          />
        </div>

        {mobileTrailingContent && (
          <div className="ml-auto sm:hidden">{mobileTrailingContent}</div>
        )}

        <div
          className={classNames(
            'hidden min-w-0 items-center gap-4 sm:ml-auto sm:flex sm:w-auto',
            showSpotifyConnect && onConnectSpotify && 'flex w-full',
          )}
        >
          <div className="hidden sm:block">
            <VolumeControl
              volume={volume}
              onVolumeChange={onVolumeChange}
              onToggleMuted={onToggleMuted}
            />
          </div>
          {showSpotifyConnect && onConnectSpotify && (
            <Button
              onClick={onConnectSpotify}
              variant="tertiary"
              className="h-12 min-w-0 flex-1 gap-2 px-3 sm:flex-none sm:px-4"
              title="Connect Spotify"
            >
              <SpotifyIcon className="h-6 w-6 shrink-0" />
              <span className="truncate font-display text-xs tracking-display">
                Connect Spotify
              </span>
            </Button>
          )}

          <div className="hidden sm:block">
            <Button
              onClick={onAddSong}
              variant="primary"
              className="h-12 min-w-0 gap-3 px-4 sm:px-6"
              title="Add Song"
            >
              <PlusIcon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap font-display text-xs tracking-display">
                Add Song
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
