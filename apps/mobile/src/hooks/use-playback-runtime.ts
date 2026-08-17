import type { PlaybackState, Room } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import {
  getEstimatedServerTimeMs,
  synchronizeServerClock,
} from '@vibes/shared';
import type { MutableRefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { getObservedPosition } from '@/hooks/use-machine-remote';

interface PlaybackRuntimeOptions {
  roomId: string;
  roomModeRef: MutableRefObject<Room['mode'] | null>;
  setError: (message: string) => void;
}

export interface PlaybackRuntimeState {
  authoritativePlayback: PlaybackState | null;
  hasLocalPlaybackChanges: boolean;
  hasLocalPlaybackPositionDrift: boolean;
  playback: PlaybackState | null;
  playbackRef: MutableRefObject<PlaybackState | null>;
  playbackResetVersion: number;
}

export interface PlaybackRuntimeActions {
  applyPlaybackUpdate: (playback: PlaybackState) => void;
  clearLocalOverrides: () => void;
  clearPlayback: () => void;
  observeLocalPlaybackPosition: (positionMs: number) => void;
  resetLocalPlayback: () => Promise<void>;
  setLocalPlaybackAligned: (isAligned: boolean) => void;
  setLocalPlaybackPosition: (positionMs: number) => void;
  setLocalPlaying: (isPlaying: boolean, positionMs?: number) => void;
}

export function usePlaybackRuntime({
  roomId,
  roomModeRef,
  setError,
}: PlaybackRuntimeOptions): readonly [
  PlaybackRuntimeState,
  PlaybackRuntimeActions,
] {
  const playbackLoader = useFetcher<PlaybackState>({
    routeId: 'rooms.$id.playback',
  });
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [authoritativePlayback, setAuthoritativePlayback] =
    useState<PlaybackState | null>(null);
  const [hasLocalPlaybackChanges, setHasLocalPlaybackChanges] = useState(false);
  const [hasLocalPlaybackPositionDrift, setHasLocalPlaybackPositionDrift] =
    useState(false);
  const [playbackResetVersion, setPlaybackResetVersion] = useState(0);
  const playbackRef = useRef<PlaybackState | null>(null);
  const authoritativePlaybackRef = useRef<PlaybackState | null>(null);
  const localPlayingRef = useRef<boolean | null>(null);

  const setLocalPlaying = useCallback(
    (isPlaying: boolean, positionMs?: number) => {
      const currentPlayback = playbackRef.current;
      if (!currentPlayback) return;
      localPlayingRef.current = isPlaying;
      setHasLocalPlaybackChanges(
        authoritativePlaybackRef.current?.isPlaying !== isPlaying,
      );
      const nextPlayback = {
        ...currentPlayback,
        isPlaying,
        positionMs: positionMs ?? currentPlayback.positionMs,
        serverTimeMs: getEstimatedServerTimeMs(),
      };
      playbackRef.current = nextPlayback;
      setPlayback(nextPlayback);
    },
    [],
  );

  const setLocalPlaybackPosition = useCallback((positionMs: number) => {
    const currentPlayback = playbackRef.current;
    if (!currentPlayback) return;
    const nextPlayback = {
      ...currentPlayback,
      positionMs,
      serverTimeMs: getEstimatedServerTimeMs(),
    };
    playbackRef.current = nextPlayback;
    setPlayback(nextPlayback);
    setHasLocalPlaybackChanges(true);
    const authoritative = authoritativePlaybackRef.current;
    if (!authoritative) return;
    setHasLocalPlaybackPositionDrift(
      Math.abs(positionMs - getObservedPosition(authoritative)) >
        alignedPositionToleranceMs,
    );
  }, []);

  const setLocalPlaybackAligned = useCallback((isAligned: boolean) => {
    const localPlaying = localPlayingRef.current;
    const authoritativePlaying = authoritativePlaybackRef.current?.isPlaying;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritativePlaying;
    setHasLocalPlaybackChanges(!(isAligned && playingIsAligned));
    if (isAligned && playingIsAligned) localPlayingRef.current = null;
  }, []);

  const observeLocalPlaybackPosition = useCallback((positionMs: number) => {
    const authoritative = authoritativePlaybackRef.current;
    if (!authoritative) return;
    const positionIsAligned =
      Math.abs(positionMs - getObservedPosition(authoritative)) <=
      alignedPositionToleranceMs;
    setHasLocalPlaybackPositionDrift(!positionIsAligned);
    const localPlaying = localPlayingRef.current;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritative.isPlaying;
    setHasLocalPlaybackChanges(!(positionIsAligned && playingIsAligned));
    if (positionIsAligned && playingIsAligned) localPlayingRef.current = null;
  }, []);

  const applyPlaybackUpdate = useCallback(
    (incomingPlayback: PlaybackState) => {
      const previousPlayback = playbackRef.current;
      const isSameSong =
        previousPlayback?.currentSong?.id === incomingPlayback.currentSong?.id;
      let nextPlayback = incomingPlayback;
      authoritativePlaybackRef.current = incomingPlayback;
      setAuthoritativePlayback(incomingPlayback);
      if (
        roomModeRef.current === 'server' &&
        localPlayingRef.current !== null
      ) {
        nextPlayback = {
          ...incomingPlayback,
          isPlaying: localPlayingRef.current,
        };
        if (
          localPlayingRef.current === false &&
          isSameSong &&
          previousPlayback
        ) {
          nextPlayback.positionMs = previousPlayback.positionMs;
        }
      }
      if (roomModeRef.current === 'host') {
        localPlayingRef.current = null;
        setHasLocalPlaybackChanges(false);
        setHasLocalPlaybackPositionDrift(false);
      }
      if (!isSameSong) setHasLocalPlaybackPositionDrift(false);
      playbackRef.current = nextPlayback;
      setPlayback(nextPlayback);
    },
    [roomModeRef],
  );

  const clearLocalOverrides = useCallback(() => {
    localPlayingRef.current = null;
    setHasLocalPlaybackChanges(false);
    setHasLocalPlaybackPositionDrift(false);
  }, []);

  const clearPlayback = useCallback(() => {
    setPlayback(null);
    setAuthoritativePlayback(null);
    playbackRef.current = null;
    authoritativePlaybackRef.current = null;
    clearLocalOverrides();
  }, [clearLocalOverrides]);

  const resetLocalPlayback = useCallback(async () => {
    if (!roomId) return;
    const result = await playbackLoader.load({ params: { id: roomId } });
    if (!result.data) {
      setError(result.error || 'Could not reset playback position.');
      return;
    }
    synchronizeServerClock(result.data.serverTimeMs);
    authoritativePlaybackRef.current = result.data;
    setAuthoritativePlayback(result.data);
    playbackRef.current = result.data;
    localPlayingRef.current = null;
    setPlayback(result.data);
    setHasLocalPlaybackChanges(false);
    setHasLocalPlaybackPositionDrift(false);
    setPlaybackResetVersion((version) => version + 1);
    setError('');
  }, [playbackLoader.load, roomId, setError]);

  return [
    {
      authoritativePlayback,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      playback,
      playbackRef,
      playbackResetVersion,
    },
    {
      applyPlaybackUpdate,
      clearLocalOverrides,
      clearPlayback,
      observeLocalPlaybackPosition,
      resetLocalPlayback,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setLocalPlaying,
    },
  ];
}

const alignedPositionToleranceMs = 5_000;
