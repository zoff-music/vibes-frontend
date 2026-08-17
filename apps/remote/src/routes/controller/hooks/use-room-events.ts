import {
  type ApiClient,
  api,
  type RoomEventCallbacks,
  subscribeRoomUpdates,
} from '@vibes/api';
import { useEffect, useRef } from 'react';

export function useRoomEvents(
  roomId: string | undefined,
  callbacks: RoomEventCallbacks,
  client: ApiClient = api,
) {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);
  useEffect(() => {
    if (!roomId) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void subscribeRoomUpdates(client, roomId, {
      onConnected: (value) => callbacksRef.current.onConnected?.(value),
      onGenerationUpdate: (value) =>
        callbacksRef.current.onGenerationUpdate?.(value),
      onHostUpdate: (value) => callbacksRef.current.onHostUpdate?.(value),
      onPlaybackUpdate: (value) =>
        callbacksRef.current.onPlaybackUpdate?.(value),
      onReconnect: () => callbacksRef.current.onReconnect?.(),
      onRoomUpdate: (value) => callbacksRef.current.onRoomUpdate?.(value),
      onSkipVote: (value) => callbacksRef.current.onSkipVote?.(value),
      onSongAdded: (value) => callbacksRef.current.onSongAdded?.(value),
      onSongsUpdate: (value) => callbacksRef.current.onSongsUpdate?.(value),
      onUsersUpdate: (value) => callbacksRef.current.onUsersUpdate?.(value),
    }).then(([error, stop]) => {
      if (!active) {
        stop?.();
        return;
      }
      if (!error && stop) unsubscribe = stop;
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [client, roomId]);
}
