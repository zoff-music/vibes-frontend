import type { AdminRoomSummary } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { api } from '../index';

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

    let isMounted = true;
    let unsubscribe: null | (() => void) = null;

    const connect = async () => {
      const [err, stop] = await api.sse('/admin/events', null, (result) => {
        const [eventError, message] = result;
        if (!isMounted || eventError || !message) return;
        if (message.type !== 'admin_rooms_update') return;
        onRoomsUpdateRef.current(message.data);
      });

      if (err || !isMounted || !stop) return;
      unsubscribe = stop;
    };

    void connect();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enabled]);
}
