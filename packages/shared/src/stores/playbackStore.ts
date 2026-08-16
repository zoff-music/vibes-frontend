import { type PlaybackState } from '@vibes/models';
import { create } from 'zustand';
import { getClientReferenceTimeMs } from '../utils/serverClock';

interface PlaybackStoreState extends PlaybackState {
  // Client-side computed fields
  actualPositionMs: number;
  clientReferenceTime: number;

  // Server mode local state
  localIsPlaying: boolean | null; // null means use server state, boolean means local override
  roomMode: string | null;
  hasLocalPlaybackChanges: boolean;
  resetVersion: number;
  authoritativePlayback: PlaybackState;
  authoritativeClientReferenceTime: number;

  // Interval management
  autoUpdateInterval: ReturnType<typeof setInterval> | null;
  startAutoUpdate: () => void;
  stopAutoUpdate: () => void;

  setPlaybackState: (state: PlaybackState, roomMode?: string) => void;
  resetPlaybackState: (state: PlaybackState, roomMode?: string) => void;
  setLocalPlaybackAligned: (isAligned: boolean) => void;
  getAuthoritativePositionMs: () => number;
  setIsPlaying: (isPlaying: boolean) => void;
  setLocalPlayingState: (isPlaying: boolean, roomMode: string) => void;
  setLocalPlaybackPosition: (positionMs: number) => void;
  updateActualPosition: () => void;
}

let visibilityListenerAttached = false;

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  positionMs: 0,
  updatedAt: new Date().toISOString(),
  serverTimeMs: Date.now(),
  actualPositionMs: 0,
  clientReferenceTime: Date.now(),
  autoUpdateInterval: null,
  localIsPlaying: null,
  roomMode: null,
  hasLocalPlaybackChanges: false,
  resetVersion: 0,
  authoritativePlayback: {
    currentSong: null,
    isPlaying: false,
    positionMs: 0,
    updatedAt: new Date().toISOString(),
    serverTimeMs: Date.now(),
  },
  authoritativeClientReferenceTime: Date.now(),

  setPlaybackState: (state, roomMode) => {
    const currentState = get();
    const receivedAt = Date.now();
    const playbackReferenceTime = getPlaybackReferenceTime(state, receivedAt);
    const isSameSong = currentState.currentSong?.id === state.currentSong?.id;
    const isSamePlaybackUpdate =
      isSameSong && currentState.updatedAt === state.updatedAt;
    const shouldResetLocalPlayback =
      currentState.currentSong !== null && !isSameSong;

    if (isSamePlaybackUpdate) {
      if (roomMode) {
        set({ roomMode });
      }
      return;
    }

    // Server playback keeps advancing independently, while play/pause remains
    // a local preference across song changes.
    if (roomMode === 'server' && currentState.localIsPlaying !== null) {
      set({
        ...state,
        isPlaying: currentState.localIsPlaying,
        authoritativeClientReferenceTime: playbackReferenceTime,
        authoritativePlayback: state,
        clientReferenceTime: playbackReferenceTime,
        hasLocalPlaybackChanges: isSameSong
          ? currentState.hasLocalPlaybackChanges
          : state.isPlaying !== currentState.localIsPlaying,
        resetVersion: shouldResetLocalPlayback
          ? currentState.resetVersion + 1
          : currentState.resetVersion,
        roomMode,
      });
      get().updateActualPosition();

      if (currentState.localIsPlaying) {
        get().startAutoUpdate();
      } else {
        get().stopAutoUpdate();
      }
      return;
    }

    // Host mode or no local override - use server state
    set({
      ...state,
      authoritativeClientReferenceTime: playbackReferenceTime,
      authoritativePlayback: state,
      clientReferenceTime: playbackReferenceTime,
      hasLocalPlaybackChanges: isSameSong
        ? currentState.hasLocalPlaybackChanges
        : false,
      localIsPlaying: null,
      resetVersion: shouldResetLocalPlayback
        ? currentState.resetVersion + 1
        : currentState.resetVersion,
      roomMode: roomMode || currentState.roomMode,
    });
    get().updateActualPosition();

    // Manage update interval based on playback state
    if (state.isPlaying) {
      get().startAutoUpdate();
    } else {
      get().stopAutoUpdate();
    }
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
    if (isPlaying) {
      get().startAutoUpdate();
    } else {
      get().stopAutoUpdate();
    }
  },

  resetPlaybackState: (state, roomMode) => {
    const currentState = get();
    const receivedAt = Date.now();
    const playbackReferenceTime = getPlaybackReferenceTime(state, receivedAt);
    set({
      ...state,
      authoritativeClientReferenceTime: playbackReferenceTime,
      authoritativePlayback: state,
      clientReferenceTime: playbackReferenceTime,
      hasLocalPlaybackChanges: false,
      localIsPlaying: null,
      resetVersion: currentState.resetVersion + 1,
      roomMode: roomMode || currentState.roomMode,
    });
    get().updateActualPosition();

    if (state.isPlaying) {
      get().startAutoUpdate();
      return;
    }
    get().stopAutoUpdate();
  },

  setLocalPlaybackAligned: (isAligned) => {
    if (isAligned) {
      set({
        hasLocalPlaybackChanges: false,
        localIsPlaying: null,
      });
      return;
    }
    set({ hasLocalPlaybackChanges: true });
  },

  getAuthoritativePositionMs: () => {
    const { authoritativeClientReferenceTime, authoritativePlayback } = get();
    if (!authoritativePlayback.isPlaying) {
      return authoritativePlayback.positionMs;
    }

    const elapsedOnClient = Math.max(
      0,
      Date.now() - authoritativeClientReferenceTime,
    );
    let positionMs = authoritativePlayback.positionMs + elapsedOnClient;
    if (authoritativePlayback.currentSong?.duration) {
      positionMs = Math.min(
        positionMs,
        authoritativePlayback.currentSong.duration * 1000,
      );
    }
    return positionMs;
  },

  setLocalPlayingState: (isPlaying, roomMode) => {
    if (roomMode === 'server') {
      set({
        isPlaying,
        localIsPlaying: isPlaying,
        roomMode,
      });
    } else {
      // Host mode - just set normally
      set({
        isPlaying,
        localIsPlaying: null,
        roomMode,
      });
    }

    if (isPlaying) {
      get().startAutoUpdate();
    } else {
      get().stopAutoUpdate();
    }
  },

  setLocalPlaybackPosition: (positionMs) => {
    set({
      actualPositionMs: positionMs,
      clientReferenceTime: Date.now(),
      hasLocalPlaybackChanges: true,
      positionMs,
    });
  },

  updateActualPosition: () => {
    const { positionMs, isPlaying, clientReferenceTime, currentSong } = get();

    if (!isPlaying) {
      set({ actualPositionMs: positionMs });
      return;
    }

    // Simple calculation: add time elapsed since we received this state
    const elapsedOnClient = Math.max(0, Date.now() - clientReferenceTime);
    let newPositionMs = positionMs + elapsedOnClient;

    // Clamp to song duration if available
    if (currentSong?.duration) {
      const durationMs = currentSong.duration * 1000;
      newPositionMs = Math.min(newPositionMs, durationMs);
    }

    set({ actualPositionMs: newPositionMs });
  },

  startAutoUpdate: () => {
    const { autoUpdateInterval, isPlaying } = get();
    if (autoUpdateInterval || !isPlaying) return;

    if (typeof document !== 'undefined' && !visibilityListenerAttached) {
      const handleVisibilityChange = () => {
        const { isPlaying: currentlyPlaying, roomMode } = get();
        const shouldThrottle = document.visibilityState === 'hidden';

        if (shouldThrottle && roomMode !== 'host') {
          get().stopAutoUpdate();
          return;
        }
        if (currentlyPlaying) {
          get().startAutoUpdate();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerAttached = true;
    }

    if (typeof document !== 'undefined') {
      const { roomMode } = get();
      if (document.visibilityState === 'hidden' && roomMode !== 'host') {
        return;
      }
    }

    const interval = setInterval(() => {
      get().updateActualPosition();
    }, 1000);

    set({ autoUpdateInterval: interval });
  },

  stopAutoUpdate: () => {
    const { autoUpdateInterval } = get();
    if (!autoUpdateInterval) return;

    clearInterval(autoUpdateInterval);
    set({ autoUpdateInterval: null });
  },
}));

function getPlaybackReferenceTime(
  state: PlaybackState,
  receivedAt: number,
): number {
  if (!state.isPlaying) {
    return receivedAt;
  }

  // Replayed SSE updates retain the server time at which the playback
  // position was measured. Preserve that elapsed time instead of treating an
  // old update as though it was created when this client received it.
  return getClientReferenceTimeMs(state.serverTimeMs, receivedAt);
}
