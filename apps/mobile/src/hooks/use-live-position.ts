import { useEffect, useState } from 'react';

export function useLivePosition(
  positionMs: number,
  isPlaying: boolean,
  durationSeconds: number,
) {
  const [position, setPosition] = useState(positionMs);

  useEffect(() => {
    setPosition(positionMs);
    if (!isPlaying) return;
    const referenceTime = Date.now();
    const durationMs = durationSeconds * 1_000;
    const interval = setInterval(() => {
      const nextPosition = positionMs + Date.now() - referenceTime;
      setPosition(
        durationMs ? Math.min(nextPosition, durationMs) : nextPosition,
      );
    }, playbackPositionIntervalMs);
    return () => clearInterval(interval);
  }, [durationSeconds, isPlaying, positionMs]);

  return position;
}

const playbackPositionIntervalMs = 250;
