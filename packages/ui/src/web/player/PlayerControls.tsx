import { classNames } from '@vibes/shared';
import React from 'preact/compat';
import { getRoomLabels } from '../../shared/room';
import { ControlGroup } from '../components/ControlGroup';
import { IconButton } from '../components/IconButton';
import { IconLinkButton } from '../components/IconLinkButton';
import { LinkButton } from '../components/LinkButton';
import { Tooltip } from '../components/Tooltip';
import {
  CastIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  VolumeIcon,
  VolumeMutedIcon,
} from '../icons';
import { SkipButton } from './SkipButton';

interface Props {
  compact?: boolean;
  roomType?: RoomType;
  isPlaying: boolean;
  canPlay: boolean;
  canSkip: boolean;
  isSkipping?: boolean;
  showReset: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  addPlaylistItemHref: string;
  castHref: string;
  showCast: boolean;
  isCasting: boolean;
  castDeviceName?: string | null;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMuted: () => void;
}

interface VolumeControlProps {
  className?: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMuted: () => void;
}

const VolumeControl = ({
  className,
  volume,
  onVolumeChange,
  onToggleMuted,
}: VolumeControlProps) => {
  const controlRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const control = controlRef.current;

    if (!control) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      event.preventDefault();
      const adjustment =
        event.deltaY < 0 ? VOLUME_WHEEL_STEP : -VOLUME_WHEEL_STEP;
      const nextVolume = Math.min(
        MAX_VOLUME,
        Math.max(MIN_VOLUME, volume + adjustment),
      );
      onVolumeChange(nextVolume);
    };

    control.addEventListener('wheel', handleWheel, { passive: false });

    return () => control.removeEventListener('wheel', handleWheel);
  }, [onVolumeChange, volume]);

  return (
    <div
      data-volume-control
      className={classNames('flex min-w-0 items-center gap-1', className)}
      ref={controlRef}
    >
      <IconButton
        aria-label={volume === 0 ? 'Unmute player' : 'Mute player'}
        className="group"
        onClick={onToggleMuted}
        variant="ghost"
      >
        {volume === 0 && <VolumeMutedIcon className="h-5 w-5" />}
        {volume > 0 && <VolumeIcon className="h-5 w-5" />}
      </IconButton>
      <div className="flex h-11 min-w-0 flex-1 touch-none select-none items-center pr-3 pl-1">
        <div className="relative h-5 min-w-0 flex-1">
          <div className="absolute inset-x-0 top-2 h-1 overflow-hidden rounded-full bg-theme-muted/20">
            <div
              className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent"
              style={{ clipPath: `inset(0 ${100 - volume}% 0 0)` }}
            />
          </div>
          <input
            aria-label="Player volume"
            aria-valuetext={`${volume} percent`}
            className="absolute inset-x-0 top-0 h-5 w-full cursor-pointer touch-none select-none appearance-none bg-transparent [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-primary"
            max="100"
            min="0"
            onInput={(event) =>
              onVolumeChange(Number(event.currentTarget.value))
            }
            type="range"
            value={volume}
          />
        </div>
      </div>
    </div>
  );
};

const MIN_VOLUME = 0;
const MAX_VOLUME = 100;
const VOLUME_WHEEL_STEP = 5;

const PlayerControlsComponent: React.FC<Props> = ({
  compact = false,
  roomType = 'MUSIC',
  isPlaying,
  canPlay,
  canSkip,
  isSkipping = false,
  showReset,
  onPlay,
  onPause,
  onReset,
  onSkip,
  addPlaylistItemHref,
  castHref,
  showCast,
  isCasting,
  castDeviceName,
  volume,
  onVolumeChange,
  onToggleMuted,
}) => {
  const playbackLabel = isPlaying ? 'Pause' : 'Play';
  const labels = getRoomLabels(roomType);

  return (
    <div className={classNames('w-full', compact && 'p-3')}>
      <div className="flex flex-wrap items-center justify-start gap-1.5 sm:flex-nowrap sm:gap-4">
        <ControlGroup aria-label="Playback controls" className="min-w-0 flex-1">
          <Tooltip className="inline-flex" content={playbackLabel}>
            <IconButton
              onClick={isPlaying ? onPause : onPlay}
              disabled={!canPlay}
              variant="ghost"
              aria-label={playbackLabel}
              className="group active:scale-95"
            >
              {isPlaying && <PauseIcon className="h-6 w-6 fill-current" />}
              {!isPlaying && (
                <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </IconButton>
          </Tooltip>

          <SkipButton
            canSkip={canSkip}
            isSkipping={isSkipping}
            onSkip={onSkip}
            variant="ghost"
          />

          {!compact && showReset && (
            <Tooltip className="inline-flex" content="Reset playback">
              <IconButton
                onClick={onReset}
                variant="ghost"
                aria-label="Reset playback"
              >
                <ResetIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          )}

          <div
            className={classNames('hidden', !compact && showCast && 'sm:block')}
          >
            <Tooltip
              className="inline-flex"
              content={
                isCasting && castDeviceName
                  ? `Casting to ${castDeviceName}`
                  : 'Cast'
              }
            >
              <IconLinkButton
                to={castHref}
                replace
                preventScrollReset
                viewTransition={false}
                prefetch="intent"
                prefetchData
                variant={isCasting ? 'tertiary-active' : 'ghost'}
                aria-label={
                  isCasting && castDeviceName
                    ? `Casting to ${castDeviceName}`
                    : 'Cast'
                }
              >
                <CastIcon className="h-5 w-5" showDot={isCasting} />
              </IconLinkButton>
            </Tooltip>
          </div>
          <VolumeControl
            className="ml-auto w-24 max-w-52 flex-1 sm:w-auto"
            volume={volume}
            onVolumeChange={onVolumeChange}
            onToggleMuted={onToggleMuted}
          />
        </ControlGroup>

        <div
          className={classNames(
            'hidden min-w-0 items-center gap-4',
            !compact && 'sm:ml-auto sm:flex sm:w-auto',
          )}
        >
          <div className="hidden sm:block">
            <LinkButton
              to={addPlaylistItemHref}
              replace
              preventScrollReset
              viewTransition={false}
              prefetch="intent"
              prefetchData
              variant="primary"
              className="h-14 min-w-0 gap-3 px-4 sm:px-6"
              title={labels.add}
            >
              <PlusIcon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap">{labels.add}</span>
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);

import type { RoomType } from '@vibes/models';
