import {
  isTruthyFlag,
  safeWrapAsync,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useCallback, useEffect } from 'react';
import { useCastStore } from '../stores/castStore';
import { useThemeStore } from '../stores/themeStore';
import { useCastRoomHandshake } from './useCastRoomHandshake';

/**
 * Hook to integrate casting functionality with the existing playback system
 */
export const useCasting = (_roomId: string) => {
  const isConnected = useCastStore((state) => state.isConnected);
  const currentSession = useCastStore((state) => state.currentSession);
  const availableDevices = useCastStore((state) => state.availableDevices);
  const lastError = useCastStore((state) => state.lastError);
  const syncPlaybackState = useCastStore((state) => state.syncPlaybackState);
  const updateQueue = useCastStore((state) => state.updateQueue);
  const updateRoomInfo = useCastStore((state) => state.updateRoomInfo);
  const updateTheme = useCastStore((state) => state.updateTheme);
  const clearError = useCastStore((state) => state.clearError);

  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const playbackUpdatedAt = usePlaybackStore((state) => state.updatedAt);
  const queueSongs = useQueueStore((state) => state.songs);
  const room = useRoomStore((state) => state.room);
  const usersCount = useRoomStore((state) => state.usersCount);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

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
  const stableUpdateTheme = useCallback(updateTheme, []);

  useEffect(() => {
    if (!isLocalEmulatorEnabled) return;
    if (isConnected) return;
    if (availableDevices.length === 0) return;
    console.log('[Cast] local emulator available; waiting for user connect');
  }, [isConnected, isLocalEmulatorEnabled, availableDevices.length]);

  const initializedSessionIdRef = useCastRoomHandshake({
    currentSession,
    isConnected,
    roomId: _roomId,
    syncPlaybackState: stableSyncPlaybackState,
  });

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
          updatedAt: playbackUpdatedAt,
          serverTimeMs: usePlaybackStore.getState().serverTimeMs,
        }),
      );
      if (error) {
        console.error('Failed to sync playback state:', error);
      }
    })();
  }, [
    isConnected,
    isPlaying,
    currentSong?.id,
    currentSession?.id,
    playbackUpdatedAt,
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

  useEffect(() => {
    if (!isConnected || !currentSession) return;
    if (initializedSessionIdRef.current !== currentSession.id) return;

    void (async () => {
      const [error] = await safeWrapAsync(stableUpdateTheme(resolvedTheme));
      if (error) {
        console.error('Failed to update cast display theme:', error);
      }
    })();
  }, [currentSession?.id, isConnected, resolvedTheme, stableUpdateTheme]);

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
