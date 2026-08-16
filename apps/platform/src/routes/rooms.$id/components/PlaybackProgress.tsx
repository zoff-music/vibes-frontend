import { usePlaybackStore } from '@vibes/shared';
import { TerminalProgress } from '@vibes/ui/konami';
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
      const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
      };

      return (
        <TerminalProgress
          aria-label="Server playback position"
          className="mt-3"
          end={formatTime(durationMs)}
          max={durationMs}
          start={`SERVER ${formatTime(boundedPosition)}`}
          value={boundedPosition}
        />
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
