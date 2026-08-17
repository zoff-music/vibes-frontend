import type { AdminRoomSummary } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { subscribeAdminEvents } from '../adminEvents';

interface UseAdminEventsParameters {
  enabled: boolean;
  onRoomsUpdate: (rooms: AdminRoomSummary[]) => void;
}

export function useAdminEvents({
  enabled,
  onRoomsUpdate,
}: UseAdminEventsParameters) {
  const onRoomsUpdateRef = useRef(onRoomsUpdate);
  useEffect(() => {
    onRoomsUpdateRef.current = onRoomsUpdate;
  }, [onRoomsUpdate]);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void subscribeAdminEvents((rooms) => {
      if (active) onRoomsUpdateRef.current(rooms);
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
  }, [enabled]);
}
