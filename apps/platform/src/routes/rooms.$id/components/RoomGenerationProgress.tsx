import { classNames } from '@vibes/shared';
import { AlertCircleIcon, SparklesIcon } from '@vibes/ui';
import { useEffect, useState } from 'react';

const GENERATION_MESSAGES = [
  'Generating your playlist',
  'Finding songs that fit the vibe',
  'Digging through hidden gems',
  'Looking for the perfect opener',
  'Balancing familiar favorites',
  'Adding a few surprises',
  'Checking tracks on YouTube',
  'Avoiding suspiciously long videos',
  'Keeping the energy flowing',
  'Making sure the artists fit',
  'Putting the songs in order',
  'Giving the queue a final polish',
  'Adding songs to your room',
  'Almost ready to press play',
  'Reading between the lines',
  'Matching the mood to the moment',
  'Following the musical thread',
  'Chasing the right kind of energy',
  'Mixing classics with discoveries',
  'Trimming anything that breaks the flow',
  'Hunting down official uploads',
  'Double-checking the song choices',
  'Shaping the middle of the playlist',
  'Saving the best finish for last',
];

const TAKING_LONGER_DELAY_MS = 2.5 * 60 * 1000;

interface RoomGenerationProgressProps {
  error?: string;
  isFailed: boolean;
}

export function RoomGenerationProgress({
  error,
  isFailed,
}: RoomGenerationProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    if (isFailed) {
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % GENERATION_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [isFailed]);

  useEffect(() => {
    if (isFailed) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsTakingLonger(true);
    }, TAKING_LONGER_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isFailed]);

  return (
    <div className="mx-auto flex h-full max-w-3xl items-center justify-center px-4 py-12">
      <div
        className={classNames(
          'panel-surface w-full rounded-3xl border p-8 text-center shadow-2xl sm:p-12',
          isFailed && 'border-error/60',
          !isFailed &&
            'animate-pulse border-secondary/60 shadow-secondary-progress',
        )}
      >
        {!isFailed && (
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <SparklesIcon className="h-10 w-10 animate-ai-sparkles" />
          </div>
        )}
        {isFailed && (
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertCircleIcon className="h-10 w-10" />
          </div>
        )}

        <h2 className="font-pixel text-lg text-theme sm:text-xl">
          {!isFailed && GENERATION_MESSAGES[messageIndex]}
          {isFailed && 'Playlist generation stopped'}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-theme-muted sm:text-base">
          {!isFailed &&
            'Your room is ready to share. The playlist will keep generating even if you refresh or leave this page.'}
          {isFailed &&
            (error ??
              'Could not finish this playlist. You can still use the room normally.')}
        </p>
        {!isFailed && isTakingLonger && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-theme-subtle sm:text-base">
            This is taking longer than usual.
          </p>
        )}
      </div>
    </div>
  );
}
