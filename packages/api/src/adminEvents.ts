import type { AdminRoomSummaryV2 } from '@vibes/models';
import { adminApi } from './admin';

export function subscribeAdminEvents(
  onRoomsUpdate: (rooms: AdminRoomSummaryV2[]) => void,
): Promise<[Error | null, (() => void) | null]> {
  return adminApi.v2.sse('/admin/events', null, ([eventError, message]) => {
    if (eventError || !message) return;
    if (message.type !== 'admin_rooms_update') return;
    onRoomsUpdate(message.data);
  });
}
