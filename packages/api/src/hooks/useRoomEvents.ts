import { useEffect, useRef } from 'react';
import { type ApiClient, type ApiV2Client, api, apiV2 } from '../client';
import {
  type RoomEventCallbacks,
  subscribeRoomUpdates,
  subscribeRoomUpdatesV2,
} from '../roomEvents';

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

export function useRoomEventsV2(
  roomId: string | undefined,
  callbacks: RoomEventCallbacks,
  client: ApiV2Client = apiV2,
) {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void subscribeRoomUpdatesV2(client, roomId, {
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
      onSongRemoved: (value) => callbacksRef.current.onSongRemoved?.(value),
      onSongUpdated: (value) => callbacksRef.current.onSongUpdated?.(value),
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
