import type { PlaybackStateV2, RoomV2 } from '@vibes/models';
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
  roomModeRef: MutableRefObject<RoomV2['mode'] | null>;
  setError: (message: string) => void;
}

export interface PlaybackRuntimeState {
  authoritativePlayback: PlaybackStateV2 | null;
  hasLocalPlaybackChanges: boolean;
  hasLocalPlaybackPositionDrift: boolean;
  playback: PlaybackStateV2 | null;
  playbackRef: MutableRefObject<PlaybackStateV2 | null>;
  playbackResetVersion: number;
}

export interface PlaybackRuntimeActions {
  applyPlaybackUpdate: (playback: PlaybackStateV2) => void;
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
  const [, playbackLoader] = useFetcher<PlaybackStateV2>({
    routeId: 'rooms.$id.playback',
  });
  const [playback, setPlayback] = useState<PlaybackStateV2 | null>(null);
  const [authoritativePlayback, setAuthoritativePlayback] =
    useState<PlaybackStateV2 | null>(null);
  const [hasLocalPlaybackChanges, setHasLocalPlaybackChanges] = useState(false);
  const [hasLocalPlaybackPositionDrift, setHasLocalPlaybackPositionDrift] =
    useState(false);
  const [playbackResetVersion, setPlaybackResetVersion] = useState(0);
  const playbackRef = useRef<PlaybackStateV2 | null>(null);
  const authoritativePlaybackRef = useRef<PlaybackStateV2 | null>(null);
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
    (incomingPlayback: PlaybackStateV2) => {
      const previousPlayback = playbackRef.current;
      const isSamePlaylistItem =
        previousPlayback?.currentPlaylistItem?.id ===
        incomingPlayback.currentPlaylistItem?.id;
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
          isSamePlaylistItem &&
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
      if (!isSamePlaylistItem) setHasLocalPlaybackPositionDrift(false);
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
