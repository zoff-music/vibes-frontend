import type { EventCursor, RoomMessage } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { type ApiClient, api } from '../client';

interface MessageCallbacks {
  onMessage: (message: RoomMessage) => void;
  onError: (error: Error | null) => void;
}

// A separate subscription lets a device opt out without interrupting playback.
export function useRoomMessages(
  roomId: string | undefined,
  callbacks: MessageCallbacks,
  client: ApiClient = api,
) {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);
  useEffect(() => {
    if (!roomId) return;
    let active = true;
    let cursor = '';
    let stop: (() => void) | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = async () => {
      const [error, unsubscribe] = await client.sse(
        '/rooms/{id}/messages',
        {
          id: roomId,
          $search: cursor ? { lastEventId: cursor } : undefined,
        },
        (
          result: [
            Error | null,
            (
              | { type: 'message'; data: RoomMessage }
              | { type: 'event_cursor'; data: EventCursor }
              | null
            ),
          ],
        ) => {
          if (!active) return;
          const [eventError, event] = result;
          if (eventError) {
            callbacksRef.current.onError(eventError);
            return;
          }
          if (!event) return;
          callbacksRef.current.onError(null);
          if (event.type === 'event_cursor') {
            cursor = event.data.id;
            return;
          }
          callbacksRef.current.onMessage(event.data);
        },
      );
      if (!active) {
        unsubscribe?.();
        return;
      }
      stop = unsubscribe;
      if (error) {
        callbacksRef.current.onError(error);
        retry = setTimeout(() => {
          void connect();
        }, 3000);
      }
    };
    void connect();
    return () => {
      active = false;
      stop?.();
      clearTimeout(retry);
    };
  }, [client, roomId]);
}
