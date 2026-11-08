import { classNames } from '@vibes/shared';
import type React from 'preact/compat';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '../../shared';

interface PlaybackProgressProps {
  smooth?: boolean;
  disabled?: boolean;
  durationMs: number;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onPointerDown?: React.PointerEventHandler<HTMLInputElement>;
  onPointerUp?: React.PointerEventHandler<HTMLInputElement>;
  positionMs: number;
  showTimes?: boolean;
  size?: 'normal' | 'comfortable';
}

export function PlaybackProgress({
  smooth = false,
  disabled = true,
  durationMs,
  name,
  onChange,
  onKeyUp,
  onPointerDown,
  onPointerUp,
  positionMs,
  showTimes = true,
  size = 'normal',
}: PlaybackProgressProps) {
  const { boundedPositionMs, progress } = getPlaybackPresentation(
    positionMs,
    durationMs,
  );
  const isInteractive = !disabled && durationMs > 0;

  return (
    <div>
      <div
        className={classNames(
          'relative flex items-center',
          size === 'comfortable' ? 'h-11' : 'h-5',
        )}
      >
        <div
          aria-hidden="true"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/12"
        >
          <div
            className={classNames(
              'gradient-playback absolute inset-0',
              smooth &&
                'motion-safe:transition-[clip-path] motion-safe:duration-700 motion-safe:ease-linear',
            )}
            style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}
          />
        </div>
        {isInteractive && (
          <input
            aria-label="Playback position"
            aria-valuetext={`${formatPlaybackMilliseconds(boundedPositionMs)} of ${formatPlaybackMilliseconds(durationMs)}`}
            className="range-progress absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent"
            max={durationMs}
            min={0}
            {...(name && { name })}
            {...(onChange && { onChange })}
            {...(onKeyUp && { onKeyUp })}
            {...(onPointerDown && { onPointerDown })}
            {...(onPointerUp && { onPointerUp })}
            type="range"
            value={boundedPositionMs}
          />
        )}
      </div>
      {showTimes && (
        <div className="text-2xs text-theme-subtle mt-1 flex justify-between font-mono">
          <span>{formatPlaybackMilliseconds(boundedPositionMs)}</span>
          <span>{formatPlaybackMilliseconds(durationMs)}</span>
        </div>
      )}
    </div>
  );
}
