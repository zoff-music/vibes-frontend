export function mediaSessionPosition(
  durationSeconds: number,
  positionMs: number,
): MediaPositionState | undefined {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

  return {
    duration: durationSeconds,
    playbackRate: 1,
    position: Math.min(
      durationSeconds,
      Math.max(0, Number.isFinite(positionMs) ? positionMs / 1000 : 0),
    ),
  };
}
