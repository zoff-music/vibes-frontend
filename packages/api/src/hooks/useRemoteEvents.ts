import { safeWrapAsync } from '@vibes/shared/wrap';
import { useEffect, useRef } from 'react';
import type { RemoteEventSubscriptionOptions } from '../remoteEvents';

export function useRemoteEvents(options: RemoteEventSubscriptionOptions) {
  const callbacksRef = useRef(options);
  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  const { client, controller, remoteId } = options;
  useEffect(() => {
    if (!remoteId) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;

    async function subscribe() {
      const [loadError, transport] = await safeWrapAsync(
        import('../remoteEvents'),
      );
      if (!active || loadError || !transport) return;

      const [error, stop] = await transport.subscribeRemoteEvents({
        ...(client ? { client } : {}),
        controller,
        remoteId,
        onRoomUpdate: (event) => callbacksRef.current.onRoomUpdate(event),
        onStateUpdate: (event) => callbacksRef.current.onStateUpdate?.(event),
      });
      if (!active) {
        stop?.();
        return;
      }
      if (!error && stop) unsubscribe = stop;
    }

    void subscribe();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [client, controller, remoteId]);
}
