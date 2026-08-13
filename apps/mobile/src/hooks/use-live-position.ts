import { useEffect, useState } from 'react';

export function useLivePosition(
  positionMs: number,
  isPlaying: boolean,
  durationSeconds: number,
  referenceTimeMs?: number,
) {
  const referenceKey = `${positionMs}:${isPlaying}:${durationSeconds}:${referenceTimeMs ?? 'local'}`;
  const resolvedPosition = getLivePosition(
    positionMs,
    isPlaying,
    durationSeconds,
    referenceTimeMs ?? Date.now(),
  );
  const [positionState, setPositionState] = useState({
    key: referenceKey,
    positionMs: resolvedPosition,
  });

  useEffect(() => {
    const referenceTime = referenceTimeMs ?? Date.now();
    const updatePosition = () => {
      setPositionState({
        key: referenceKey,
        positionMs: getLivePosition(
          positionMs,
          isPlaying,
          durationSeconds,
          referenceTime,
        ),
      });
    };
    updatePosition();
    if (!isPlaying) return;
    const interval = setInterval(updatePosition, playbackPositionIntervalMs);
    return () => clearInterval(interval);
  }, [durationSeconds, isPlaying, positionMs, referenceKey, referenceTimeMs]);

  if (positionState.key !== referenceKey) {
    return resolvedPosition;
  }
  return positionState.positionMs;
}

function getLivePosition(
  positionMs: number,
  isPlaying: boolean,
  durationSeconds: number,
  referenceTimeMs: number,
) {
  if (!isPlaying) return positionMs;
  const durationMs = durationSeconds * millisecondsPerSecond;
  const nextPosition = positionMs + Math.max(Date.now() - referenceTimeMs, 0);
  return durationMs ? Math.min(nextPosition, durationMs) : nextPosition;
}

const playbackPositionIntervalMs = 250;
const millisecondsPerSecond = 1_000;
