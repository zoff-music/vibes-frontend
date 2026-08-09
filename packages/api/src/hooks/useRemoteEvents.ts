import type { RemoteEvent } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { type ApiClient, api, createApiClient } from '../index';

interface Options {
  client?: ApiClient;
  remoteId?: string;
  controller?: boolean;
  onRoomUpdate: (event: RemoteEvent) => void;
  onStateUpdate?: (event: RemoteEvent) => void;
}

export function useRemoteEvents({
  client: eventClient,
  remoteId,
  controller = false,
  onRoomUpdate,
  onStateUpdate,
}: Options) {
  const onRoomUpdateRef = useRef(onRoomUpdate);
  const onStateUpdateRef = useRef(onStateUpdate);

  useEffect(() => {
    onRoomUpdateRef.current = onRoomUpdate;
  }, [onRoomUpdate]);

  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
  }, [onStateUpdate]);

  useEffect(() => {
    if (!remoteId) return;

    const client =
      eventClient ??
      (controller ? createApiClient({ 'X-Zoff-Remote-ID': remoteId }) : api);
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
            type: 'remote_room_update' | 'remote_state_update';
          };
          if (event.type === 'remote_state_update') {
            onStateUpdateRef.current?.(event.data);
            return;
          }
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
  }, [controller, eventClient, remoteId]);
}
