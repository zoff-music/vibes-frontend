import type { CastSession } from '@vibes/models';
import { safeWrapAsync, showToast, usePlaybackStore } from '@vibes/shared';
import { useCallback, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../routes/rooms.$id/action';
import { useCastStore } from '../stores/castStore';

type SyncPlaybackState = ReturnType<
  typeof useCastStore.getState
>['syncPlaybackState'];

interface CastRoomHandshakeOptions {
  currentSession: CastSession | null;
  isConnected: boolean;
  roomId: string;
  syncPlaybackState: SyncPlaybackState;
}

export function useCastRoomHandshake({
  currentSession,
  isConnected,
  roomId,
  syncPlaybackState,
}: CastRoomHandshakeOptions) {
  const tokenFetcher = useFetcher<RoomActionData>();
  const initializedSessionIdRef = useRef<string | null>(null);
  const requestedHandshakeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !currentSession || !roomId) {
      initializedSessionIdRef.current = null;
      requestedHandshakeRef.current = null;
      return;
    }

    const handshakeId = `${currentSession.id}:${roomId}`;
    if (requestedHandshakeRef.current === handshakeId) return;

    requestedHandshakeRef.current = handshakeId;
    tokenFetcher.submit(
      { intent: 'castingToken' },
      { encType: 'application/json', method: 'post' },
    );
  }, [currentSession, isConnected, roomId, tokenFetcher.submit]);

  useEffect(() => {
    const data = tokenFetcher.data;
    if (data?.intent !== 'castingToken') return;
    if (data.error) {
      showToast(data.error, 'error');
      return;
    }

    const casting = data.casting;
    if (!isConnected || !currentSession || !casting) return;

    const handshakeId = `${currentSession.id}:${casting.roomId}`;
    if (requestedHandshakeRef.current !== handshakeId) return;

    let cancelled = false;
    const sessionId = currentSession.id;

    void (async () => {
      const { joinRoom } = useCastStore.getState();
      const [joinError] = await safeWrapAsync(
        joinRoom(casting.roomId, casting.token.token),
      );
      if (joinError) {
        console.error('Failed to send cast room handshake:', joinError);
        return;
      }
      if (cancelled) return;

      initializedSessionIdRef.current = sessionId;
      const playbackState = usePlaybackStore.getState();
      if (!playbackState.currentSong) return;

      const [syncError] = await safeWrapAsync(
        syncPlaybackState({
          currentSong: playbackState.currentSong,
          isPlaying: playbackState.isPlaying,
          positionMs: playbackState.actualPositionMs,
          serverTimeMs: playbackState.serverTimeMs,
          updatedAt: playbackState.updatedAt,
        }),
      );
      if (syncError) {
        console.error('Failed to send initial cast playback state:', syncError);
      }
    })();

    return () => {
      cancelled = true;
      if (initializedSessionIdRef.current === sessionId) {
        initializedSessionIdRef.current = null;
      }
    };
  }, [currentSession, isConnected, syncPlaybackState, tokenFetcher.data]);

  return useCallback(
    (sessionId: string) => initializedSessionIdRef.current === sessionId,
    [],
  );
}
