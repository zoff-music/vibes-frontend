import { useEffect, useRef } from 'react';
import {
  type RemoteEventSubscriptionOptions,
  subscribeRemoteEvents,
} from '../remoteEvents';

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
    void subscribeRemoteEvents({
      ...(client ? { client } : {}),
      controller,
      remoteId,
      onRoomUpdate: (event) => callbacksRef.current.onRoomUpdate(event),
      onStateUpdate: (event) => callbacksRef.current.onStateUpdate?.(event),
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
  }, [client, controller, remoteId]);
}
