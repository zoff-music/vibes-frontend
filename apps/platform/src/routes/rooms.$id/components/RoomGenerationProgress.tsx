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
];

interface RoomGenerationProgressProps {
  error?: string;
  isFailed: boolean;
}

export function RoomGenerationProgress({
  error,
  isFailed,
}: RoomGenerationProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isFailed) {
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % GENERATION_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [isFailed]);

  return (
    <div className="mx-auto flex h-full max-w-3xl items-center justify-center px-4 py-12">
      <div
        className={classNames(
          'panel-surface w-full rounded-3xl border p-8 text-center shadow-2xl sm:p-12',
          isFailed && 'border-error/60',
          !isFailed &&
            'animate-pulse border-secondary/60 shadow-[0_0_40px_rgba(0,217,255,0.2)]',
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
      </div>
    </div>
  );
}
