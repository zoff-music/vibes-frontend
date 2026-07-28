import {
  isTruthyFlag,
  safeWrapAsync,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useCallback, useEffect, useRef } from 'react';
import { useCastStore } from '../stores/castStore';

/**
 * Hook to integrate casting functionality with the existing playback system
 */
export const useCasting = (_roomId: string) => {
  const {
    isConnected,
    currentSession,
    availableDevices,
    lastError,
    syncPlaybackState,
    updateQueue,
    updateRoomInfo,
    clearError,
  } = useCastStore();

  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const queueSongs = useQueueStore((state) => state.songs);
  const room = useRoomStore((state) => state.room);
  const usersCount = useRoomStore((state) => state.usersCount);

  const isLocalEmulatorEnabled = (() => {
    if (isTruthyFlag(import.meta.env.VITE_CAST_LOCAL_EMULATOR)) {
      return true;
    }
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    );
  })();

  // Create stable callback references
  const stableSyncPlaybackState = useCallback(syncPlaybackState, []);
  const stableUpdateQueue = useCallback(updateQueue, []);
  const stableUpdateRoomInfo = useCallback(updateRoomInfo, []);

  useEffect(() => {
    if (!isLocalEmulatorEnabled) return;
    if (isConnected) return;
    if (availableDevices.length === 0) return;
    console.log('[Cast] local emulator available; waiting for user connect');
  }, [isConnected, isLocalEmulatorEnabled, availableDevices.length]);

  const initializedSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !currentSession || !_roomId) return;

    let cancelled = false;
    const sessionId = currentSession.id;

    void (async () => {
      console.log('[Cast] starting ordered room handshake:', _roomId);
      const { joinRoom } = useCastStore.getState();
      const [joinError] = await safeWrapAsync(joinRoom(_roomId));
      if (joinError) {
        console.error('Failed to send joinRoom handshake:', joinError);
        return;
      }
      if (cancelled) return;

      initializedSessionIdRef.current = sessionId;
      const playbackState = usePlaybackStore.getState();
      if (!playbackState.currentSong) return;

      const [syncError] = await safeWrapAsync(
        stableSyncPlaybackState({
          isPlaying: playbackState.isPlaying,
          positionMs: playbackState.actualPositionMs,
          currentSong: playbackState.currentSong,
          updatedAt: new Date().toISOString(),
          serverTimeMs: Date.now(),
        }),
      );
      if (syncError) {
        console.error('Failed to send initial playback state:', syncError);
      }
    })();

    return () => {
      cancelled = true;
      if (initializedSessionIdRef.current === sessionId) {
        initializedSessionIdRef.current = null;
      }
    };
  }, [isConnected, currentSession?.id, _roomId, stableSyncPlaybackState]);

  useEffect(() => {
    if (!isConnected || !currentSession || !currentSong) return;
    if (initializedSessionIdRef.current !== currentSession.id) return;

    const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
    console.log('[Cast] syncing playback state', {
      title: currentSong.title,
      isPlaying,
      positionMs: actualPositionMs,
    });
    void (async () => {
      const [error] = await safeWrapAsync(
        stableSyncPlaybackState({
          isPlaying,
          positionMs: actualPositionMs,
          currentSong,
          updatedAt: new Date().toISOString(),
          serverTimeMs: Date.now(),
        }),
      );
      if (error) {
        console.error('Failed to sync playback state:', error);
      }
    })();
  }, [
    isConnected,
    isPlaying,
    currentSong,
    currentSession?.id,
    stableSyncPlaybackState,
  ]);

  useEffect(() => {
    if (currentSession?.deviceId !== 'local-cast-emulator') return;
    if (!room) return;

    void (async () => {
      const [error] = await safeWrapAsync(
        stableUpdateRoomInfo({
          name: room.name,
          participantCount: usersCount,
        }),
      );
      if (error) {
        console.error('Failed to update local room info:', error);
      }
    })();
  }, [currentSession?.deviceId, room, usersCount, stableUpdateRoomInfo]);

  useEffect(() => {
    if (currentSession?.deviceId !== 'local-cast-emulator') return;

    void (async () => {
      const [error] = await safeWrapAsync(stableUpdateQueue(queueSongs));
      if (error) {
        console.error('Failed to update local queue:', error);
      }
    })();
  }, [currentSession?.deviceId, queueSongs, stableUpdateQueue]);

  return {
    // State
    isConnected,
    currentSession,
    availableDevices,
    lastError,

    // Actions
    clearError,

    // Computed
    isCastingAvailable: availableDevices.length > 0,
    castDeviceName: currentSession?.deviceName || null,
  };
};
