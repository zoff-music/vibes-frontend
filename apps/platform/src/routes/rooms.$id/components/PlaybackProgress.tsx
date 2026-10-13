import { usePlaybackStore } from '@vibes/shared';
import { PlaybackProgress as SharedPlaybackProgress } from '@vibes/ui/web';
import React, { useEffect, useState } from 'react';

interface PlaybackProgressProps {
  durationMs: number;
  isSSR: boolean;
}

export const PlaybackProgress: React.FC<PlaybackProgressProps> = React.memo(
  ({ durationMs, isSSR }) => {
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
