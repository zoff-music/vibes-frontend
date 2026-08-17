import { useCallback } from 'react';
import {
  createCastApiClient,
  reportCastPlaybackFailure,
} from '../lib/castRequests';

interface UsePlaybackFailureReporterOptions {
  castToken: string | null;
  roomId: string | null;
}

export function usePlaybackFailureReporter({
  castToken,
  roomId,
}: UsePlaybackFailureReporterOptions): (songId: string) => Promise<void> {
  return useCallback(
    async (songId: string) => {
      if (!roomId || !castToken) return;
      const client = createCastApiClient(castToken);
      const [requestError] = await reportCastPlaybackFailure(
        client,
        roomId,
        songId,
      );
      if (requestError) {
        console.error('[Cast] Failed to report restricted playback failure.');
      }
    },
    [castToken, roomId],
  );
}
