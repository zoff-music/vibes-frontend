import type React from 'react';

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
  const boundedPosition = Math.min(Math.max(positionMs, 0), durationMs);
  const progress = durationMs > 0 ? boundedPosition / durationMs : 0;

  return (
    <div>
      <div className="relative flex h-5 items-center">
        <progress
          aria-hidden="true"
          className="progress-bar h-1.5 w-full"
          max={1}
          value={progress}
        />
        <input
          aria-label="Playback position"
          className="absolute inset-x-0 h-5 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default disabled:opacity-70 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-secondary [&::-moz-range-thumb]:bg-theme-surface [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-0.75 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary [&::-webkit-slider-thumb]:bg-theme-surface"
          disabled={disabled || durationMs === 0}
          max={durationMs}
          min={0}
          name={name}
          onChange={onChange}
          onKeyUp={onKeyUp}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          type="range"
          value={boundedPosition}
        />
      </div>
      {showTimes && (
        <div className="mt-1 flex justify-between font-mono text-2xs text-theme-subtle">
          <span>{formatTime(boundedPosition)}</span>
          <span>{formatTime(durationMs)}</span>
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
