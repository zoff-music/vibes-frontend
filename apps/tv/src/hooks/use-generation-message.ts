import {
  playlistGenerationMessageIntervalMs,
  playlistGenerationMessages,
} from '@vibes/ui/shared';
import { useEffect, useState } from 'react';

export function useGenerationMessage(active: boolean) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex(
        (current) => (current + 1) % playlistGenerationMessages.length,
      );
    }, playlistGenerationMessageIntervalMs);
    return () => clearInterval(interval);
  }, [active]);

  return playlistGenerationMessages[messageIndex];
}
