import {
  type PlaybackState,
  type SkipActionResponse,
  usePlaybackStore,
  useRoomStore,
} from '@vibes/shared';

import { useCallback } from 'react';
import { api, getHttpError } from '../index';
import { USE_SSE_CALLBACKS } from './useSSE';

export function usePlayback(roomId: string, callbacks?: USE_SSE_CALLBACKS) {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackStore((state) => state.positionMs);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const serverTimeMs = usePlaybackStore((state) => state.serverTimeMs);

  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );
  const roomMode = useRoomStore((state) => state.room?.mode);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info') => {
      if (callbacks?.onToast) {
        callbacks.onToast(message, type);
        return;
      }

      if (
        typeof window !== 'undefined' &&
        window.dispatchEvent &&
        typeof CustomEvent !== 'undefined'
      ) {
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: { message, type },
          }),
        );
        return;
      }

      console.error('[usePlayback] Toast unavailable:', message);
    },
    [callbacks],
  );

  const performAction = useCallback(
    async (
      action: 'play' | 'pause' | 'skip' | 'vote' | 'seek',
      positionMs?: number,
      shouldShowToast = true,
    ) => {
      let data;
      let error;

      if (action === 'play' || action === 'pause' || action === 'seek') {
        // Optimistic update for play/pause in server/host mode
        if (roomMode && (action === 'play' || action === 'pause')) {
          setLocalPlayingState(action === 'play', roomMode);
        }

        const [err, result] = await api.put(
          '/rooms/{id}/states',
          { id: roomId },
          { action, positionMs },
        );
        data = result;
        error = err;

        if (
          data &&
          roomMode === 'server' &&
          (action === 'play' || action === 'pause')
        ) {
          setLocalPlayingState(data.isPlaying, roomMode);
        }
      } else if (action === 'skip' || action === 'vote') {
        const [err, result] = await api.post(
          '/rooms/{id}/skips',
          { id: roomId },
          {},
        );
        data = result;
        error = err;
      }

      // Handle host mode skip error
      if (error) {
        let message = '';

        if (action === 'skip') {
          const msgHost = 'only hosts can skip in host mode';
          const msgDisabled = 'skipping is disabled in this room';

          if (
            error.message?.includes(msgHost) ||
            getHttpError(error)?.response.status === 403
          ) {
            message = 'Only hosts can skip in host mode';
          } else if (error.message?.includes(msgDisabled)) {
            message = 'Skipping is disabled in this room';
          }
        } else if (action === 'play' || action === 'pause') {
          message = `Failed to ${action}: ${error.message || 'Unknown error'}`;
        }

        if (message && shouldShowToast) {
          showToast(message, 'error');
        }
      }

      if (data) {
        const skipResult =
          action === 'skip' ? (data as SkipActionResponse) : null;
        const state = ((data as { playback?: PlaybackState }).playback ??
          data) as PlaybackState;
        setPlaybackState(state, roomMode);

        if (skipResult && shouldShowToast) {
          if (skipResult.skipped) {
            showToast('Skipped song', 'success');
          } else if (skipResult.alreadyVoted) {
            showToast(
              `Skip vote already counted (${skipResult.currentVotes}/${skipResult.requiredVotes})`,
              'info',
            );
          } else if (skipResult.voted) {
            showToast(
              `Skip vote added (${skipResult.currentVotes}/${skipResult.requiredVotes})`,
              'info',
            );
          } else {
            showToast('Nothing is playing', 'info');
          }
        }
      }
    },
    [roomId, setPlaybackState, setLocalPlayingState, roomMode, showToast],
  );

  const play = useCallback(() => performAction('play'), [performAction]);
  const pause = useCallback(() => performAction('pause'), [performAction]);
  const seek = useCallback(
    (positionMs: number) => performAction('seek', positionMs),
    [performAction],
  );
  const skip = useCallback(
    (shouldShowToast = true) =>
      performAction('skip', undefined, shouldShowToast),
    [performAction],
  );
  const vote = useCallback(() => performAction('vote'), [performAction]);

  const fetchPlayback = useCallback(async () => {
    if (!roomId) return;

    const [err, data] = await api.get('/rooms/{id}/states', { id: roomId });
    if (data) {
      setPlaybackState(data, roomMode);
    }
    return [err, data];
  }, [roomId, setPlaybackState, roomMode]);

  return {
    currentSong,
    isPlaying,
    positionMs,
    updatedAt,
    serverTimeMs,
    play,
    pause,
    seek,
    skip,
    vote,
    fetchPlayback,
  };
}

/**
 * Hook to get high-frequency position updates.
 * Only use this in components that actually need to render a progress bar.
 */
export function usePlaybackPosition() {
  return usePlaybackStore((state) => state.actualPositionMs);
}
