import { usePlaybackStore } from '@vibes/shared';
import { useEffect } from 'react';

export function useLivePlaybackPosition(active: boolean) {
  const positionMs = usePlaybackStore((state) => state.actualPositionMs);
  const updateActualPosition = usePlaybackStore(
    (state) => state.updateActualPosition,
  );

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(
      updateActualPosition,
      playbackPositionIntervalMs,
    );
    return () => clearInterval(interval);
  }, [active, updateActualPosition]);

  return positionMs;
}

const playbackPositionIntervalMs = 1000;
