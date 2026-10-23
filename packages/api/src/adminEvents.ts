import type { AdminRoomSummaryV2 } from '@vibes/models';
import { adminApi } from './admin';

export function subscribeAdminEvents(
  onRoomsUpdate: (rooms: AdminRoomSummaryV2[]) => void,
  onRoomUpdate: (room: AdminRoomSummaryV2) => void,
  onRoomRemoved: (roomId: string) => void,
): Promise<[Error | null, (() => void) | null]> {
  return adminApi.v3.sse('/admin/events', null, ([eventError, message]) => {
    if (eventError || !message) return;

    if (message.type === 'admin_rooms_update') onRoomsUpdate(message.data);
    if (message.type === 'admin_room_update') onRoomUpdate(message.data);
    if (message.type === 'admin_room_removed') onRoomRemoved(message.data.id);
  });
}
