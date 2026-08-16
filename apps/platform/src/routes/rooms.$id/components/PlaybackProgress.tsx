import { usePlaybackStore } from '@vibes/shared';
import { PlaybackProgress as SharedPlaybackProgress } from '@vibes/ui/web';
import React, { useEffect, useState } from 'react';

interface PlaybackProgressProps {
  durationMs: number;
  isSSR: boolean;
  terminalMode?: boolean;
}

export const PlaybackProgress: React.FC<PlaybackProgressProps> = React.memo(
  ({ durationMs, isSSR, terminalMode = false }) => {
    const authoritativePlayback = usePlaybackStore(
      (state) => state.authoritativePlayback,
    );
    const getAuthoritativePositionMs = usePlaybackStore(
      (state) => state.getAuthoritativePositionMs,
    );
    const [positionMs, setPositionMs] = useState(
      authoritativePlayback.positionMs,
    );

    useEffect(() => {
      const updatePosition = () => {
        setPositionMs(getAuthoritativePositionMs());
      };
      updatePosition();
      if (!authoritativePlayback.isPlaying) return;
      const interval = setInterval(
        updatePosition,
        PLAYBACK_POSITION_INTERVAL_MS,
      );
      return () => clearInterval(interval);
    }, [authoritativePlayback, getAuthoritativePositionMs]);

    if (terminalMode) {
      const displayedPosition = isSSR ? 0 : positionMs;
      const boundedPosition = Math.max(
        0,
        Math.min(displayedPosition, durationMs),
      );
      const progress =
        durationMs > 0 ? (boundedPosition / durationMs) * 100 : 0;
      const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
      };

      return (
        <div
          aria-label="Server playback position"
          aria-valuemax={durationMs}
          aria-valuemin={0}
          aria-valuenow={Math.round(boundedPosition)}
          className="mt-3"
          role="progressbar"
        >
          <div className="mb-1 flex justify-between text-[#a6ffd0]/65 text-[0.6rem] tabular-nums">
            <span>SERVER {formatTime(boundedPosition)}</span>
            <span>{formatTime(durationMs)}</span>
          </div>
          <div className="h-3 border border-[#71f5ad]/45 bg-black p-0.5">
            <div
              className="h-full bg-[repeating-linear-gradient(90deg,#71f5ad_0_9px,transparent_9px_12px)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <SharedPlaybackProgress
          durationMs={durationMs}
          positionMs={isSSR ? 0 : positionMs}
        />
      </div>
    );
  },
);

const PLAYBACK_POSITION_INTERVAL_MS = 250;
