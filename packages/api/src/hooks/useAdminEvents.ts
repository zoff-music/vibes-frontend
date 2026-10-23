import type { AdminRoomSummaryV2 } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { subscribeAdminEvents } from '../adminEvents';

interface UseAdminEventsParameters {
  enabled: boolean;
  revision: number;
  onRoomsUpdate: (rooms: AdminRoomSummaryV2[]) => void;
  onRoomUpdate: (room: AdminRoomSummaryV2) => void;
  onRoomRemoved: (roomId: string) => void;
}

export function useAdminEvents({
  enabled,
  revision,
  onRoomsUpdate,
  onRoomUpdate,
  onRoomRemoved,
}: UseAdminEventsParameters) {
  const subscriptionKey = enabled ? revision : null;
  const callbacks = useRef({ onRoomsUpdate, onRoomUpdate, onRoomRemoved });
  useEffect(() => {
    callbacks.current = { onRoomsUpdate, onRoomUpdate, onRoomRemoved };
  }, [onRoomsUpdate, onRoomUpdate, onRoomRemoved]);
  useEffect(() => {
    if (subscriptionKey === null) return;

    let active = true;
    let unsubscribe: (() => void) | null = null;
    void subscribeAdminEvents(
      (rooms) => {
        if (active) callbacks.current.onRoomsUpdate(rooms);
      },
      (room) => {
        if (active) callbacks.current.onRoomUpdate(room);
      },
      (roomId) => {
        if (active) callbacks.current.onRoomRemoved(roomId);
      },
    ).then(([error, stop]) => {
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
  }, [subscriptionKey]);
}
