import type React from 'react';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '../../shared';

interface PlaybackProgressProps {
  disabled?: boolean;
  durationMs: number;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onPointerDown?: React.PointerEventHandler<HTMLInputElement>;
  onPointerUp?: React.PointerEventHandler<HTMLInputElement>;
  positionMs: number;
  showTimes?: boolean;
}

export function PlaybackProgress({
  disabled = true,
  durationMs,
  name,
  onChange,
  onKeyUp,
  onPointerDown,
  onPointerUp,
  positionMs,
  showTimes = true,
}: PlaybackProgressProps) {
  const { boundedPositionMs, progress } = getPlaybackPresentation(
    positionMs,
    durationMs,
  );
  const isInteractive = !disabled && durationMs > 0;

  return (
    <div>
      <div className="relative flex h-5 items-center">
        <div
          aria-hidden="true"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/12"
        >
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,#ff3fa4,#00d9ff)] shadow-[0_0_12px_rgba(255,63,164,0.6)]"
            style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}
          />
        </div>
        {isInteractive && (
          <input
            aria-label="Playback position"
            className="absolute inset-x-0 h-5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-secondary [&::-moz-range-thumb]:bg-theme-surface [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-0.75 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary [&::-webkit-slider-thumb]:bg-theme-surface"
            max={durationMs}
            min={0}
            name={name}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            type="range"
            value={boundedPositionMs}
          />
        )}
      </div>
      {showTimes && (
        <div className="mt-1 flex justify-between font-mono text-2xs text-theme-subtle">
          <span>{formatPlaybackMilliseconds(boundedPositionMs)}</span>
          <span>{formatPlaybackMilliseconds(durationMs)}</span>
        </div>
      )}
    </div>
  );
}
