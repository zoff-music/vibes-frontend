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
          if (!active || eventError || !message) return;
          if (message.type === 'remote_state_update') {
            onStateUpdateRef.current?.(message.data);
            return;
          }
          onRoomUpdateRef.current(message.data);
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
