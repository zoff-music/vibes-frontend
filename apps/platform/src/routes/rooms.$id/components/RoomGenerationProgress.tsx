import { classNames } from '@vibes/shared';
import {
  playlistGenerationMessageIntervalMs,
  playlistGenerationMessages,
} from '@vibes/ui/shared';
import { AlertCircleIcon, SparklesIcon } from '@vibes/ui/web';
import { useEffect, useState } from 'react';

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
      setMessageIndex(
        (current) => (current + 1) % playlistGenerationMessages.length,
      );
    }, playlistGenerationMessageIntervalMs);

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
          {!isFailed && playlistGenerationMessages[messageIndex]}
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
