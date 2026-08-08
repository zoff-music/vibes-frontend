import type { RemoteEvent } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { api, createApiClient } from '../index';

interface Options {
  remoteId?: string;
  controller?: boolean;
  onRoomUpdate: (event: RemoteEvent) => void;
}

export function useRemoteEvents({
  remoteId,
  controller = false,
  onRoomUpdate,
}: Options) {
  const onRoomUpdateRef = useRef(onRoomUpdate);

  useEffect(() => {
    onRoomUpdateRef.current = onRoomUpdate;
  }, [onRoomUpdate]);

  useEffect(() => {
    if (!remoteId) return;

    const client = controller
      ? createApiClient({ 'X-Zoff-Remote-ID': remoteId })
      : api;
    let unsubscribe: (() => void) | null = null;
    let active = true;

    const subscribe = async () => {
      const [error, stop] = await client.sse(
        '/remotes/{id}/events',
        { id: remoteId },
        ([eventError, message]) => {
          if (eventError || !message) return;
          const event = message as {
            data: RemoteEvent;
            type: 'remote_room_update';
          };
          onRoomUpdateRef.current(event.data);
        },
      );
      if (!active) {
        stop?.();
        return;
      }
      if (!error && stop) {
        unsubscribe = stop;
      }
    };

    void subscribe();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [controller, remoteId]);
}
