import { usePlaybackStore } from '@vibes/shared';
import { PlaybackProgress as SharedPlaybackProgress } from '@vibes/ui';
import React from 'react';

interface PlaybackProgressProps {
  durationMs: number;
  isSSR: boolean;
}

export const PlaybackProgress: React.FC<PlaybackProgressProps> = React.memo(
  ({ durationMs, isSSR }) => {
    const actualPositionMs = usePlaybackStore(
      (state) => state.actualPositionMs,
    );

    return (
      <div className="mt-3">
        <SharedPlaybackProgress
          durationMs={durationMs}
          positionMs={isSSR ? 0 : actualPositionMs}
        />
      </div>
    );
  },
);
