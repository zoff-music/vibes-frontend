import { useEffect, useRef } from 'react';
import { type ApiV3Client, apiV3 } from '../client';
import {
  type RoomEventV3Callbacks,
  subscribeRoomUpdatesV3,
} from '../roomEvents';

export function useRoomEventsV3(
  roomId: string | undefined,
  callbacks: RoomEventV3Callbacks,
  client: ApiV3Client = apiV3,
) {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void subscribeRoomUpdatesV3(client, roomId, {
      onConnected: (value) => callbacksRef.current.onConnected?.(value),
      onGenerationUpdate: (value) =>
        callbacksRef.current.onGenerationUpdate?.(value),
      onHostUpdate: (value) => callbacksRef.current.onHostUpdate?.(value),
      onPlaybackUpdate: (value) =>
        callbacksRef.current.onPlaybackUpdate?.(value),
      onReconnect: () => callbacksRef.current.onReconnect?.(),
      onRoomUpdate: (value) => callbacksRef.current.onRoomUpdate?.(value),
      onSkipVote: (value) => callbacksRef.current.onSkipVote?.(value),
      onPlaylistItemAdded: (value) =>
        callbacksRef.current.onPlaylistItemAdded?.(value),
      onPlaylistItemRemoved: (value) =>
        callbacksRef.current.onPlaylistItemRemoved?.(value),
      onPlaylistItemUpdated: (value) =>
        callbacksRef.current.onPlaylistItemUpdated?.(value),
      onPlaylistItemsUpdate: (value) =>
        callbacksRef.current.onPlaylistItemsUpdate?.(value),
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
