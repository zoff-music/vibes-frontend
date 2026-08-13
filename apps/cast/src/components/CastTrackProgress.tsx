import type { Song } from '@vibes/shared';
import { usePlaybackStore } from '@vibes/shared';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { useEffect, useState } from 'react';

interface Props {
  song: Song;
}

export function CastTrackProgress({ song }: Props) {
  const authoritativePlayback = usePlaybackStore(
    (state) => state.authoritativePlayback,
  );
  const getAuthoritativePositionMs = usePlaybackStore(
    (state) => state.getAuthoritativePositionMs,
  );
  const [authoritativePositionMs, setAuthoritativePositionMs] = useState(
    authoritativePlayback.positionMs,
  );
  const durationMs = (song.duration || 0) * millisecondsPerSecond;
  const { boundedPositionMs } = getPlaybackPresentation(
    authoritativePositionMs,
    durationMs,
  );

  useEffect(() => {
    const updatePosition = () => {
      setAuthoritativePositionMs(getAuthoritativePositionMs());
    };
    updatePosition();
    if (!authoritativePlayback.isPlaying) return;
    const interval = setInterval(updatePosition, playbackPositionIntervalMs);
    return () => clearInterval(interval);
  }, [authoritativePlayback, getAuthoritativePositionMs]);

  return (
    <div className="cast-track-progress mt-4">
      <div className="mb-2 flex justify-between font-mono text-sm text-white/60">
        <span>{formatPlaybackMilliseconds(boundedPositionMs)}</span>
        <span>{formatPlaybackMilliseconds(durationMs)}</span>
      </div>
      <progress
        aria-label="Playback progress"
        className="h-2 w-full appearance-none overflow-hidden rounded-full bg-white/20 [&::-moz-progress-bar]:bg-secondary [&::-webkit-progress-bar]:bg-white/20 [&::-webkit-progress-value]:bg-secondary"
        max={durationMs || millisecondsPerSecond}
        value={boundedPositionMs}
      />
    </div>
  );
}

const millisecondsPerSecond = 1_000;

const playbackPositionIntervalMs = 250;
