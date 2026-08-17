import type { PlaybackState } from '@vibes/models';
import { getClientReferenceTimeMs } from '@vibes/shared';
import {
  formatPlaybackSeconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { useEffect, useState } from 'react';

interface TizenPlaybackStatusProps {
  durationSeconds: number;
  playback: PlaybackState;
}

export function TizenPlaybackStatus({
  durationSeconds,
  playback,
}: TizenPlaybackStatusProps) {
  const [positionMs, setPositionMs] = useState(() => getLivePosition(playback));
  useEffect(() => {
    setPositionMs(getLivePosition(playback));
    if (!playback.isPlaying) return;
    const interval = window.setInterval(
      () => setPositionMs(getLivePosition(playback)),
      playbackPositionIntervalMs,
    );
    return () => window.clearInterval(interval);
  }, [playback]);
  const progress = getPlaybackPresentation(
    positionMs,
    durationSeconds * millisecondsPerSecond,
  ).progress;

  return (
    <>
      <div className="mt-4 flex justify-between text-sm text-white/60">
        <span>{formatPlaybackSeconds(positionMs / millisecondsPerSecond)}</span>
        <span>{formatPlaybackSeconds(durationSeconds)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full bg-accent"
          style={{ width: `${progress * percentageMultiplier}%` }}
        />
      </div>
    </>
  );
}

const millisecondsPerSecond = 1000;
const percentageMultiplier = 100;
const playbackPositionIntervalMs = 1000;

function getLivePosition(playback: PlaybackState): number {
  if (!playback.isPlaying) return playback.positionMs;
  const referenceTime = getClientReferenceTimeMs(playback.serverTimeMs);
  const positionMs =
    playback.positionMs + Math.max(0, Date.now() - referenceTime);
  if (!playback.currentSong?.duration) return positionMs;
  return Math.min(
    positionMs,
    playback.currentSong.duration * millisecondsPerSecond,
  );
}
