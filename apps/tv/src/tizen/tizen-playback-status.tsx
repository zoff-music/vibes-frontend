import {
  formatPlaybackSeconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { useLivePlaybackPosition } from '@/hooks/use-live-playback-position';

interface TizenPlaybackStatusProps {
  durationSeconds: number;
}

export function TizenPlaybackStatus({
  durationSeconds,
}: TizenPlaybackStatusProps) {
  const positionMs = useLivePlaybackPosition(true);
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
