import type { AdminRoomSummary } from '@vibes/models';
import { api } from './index';

export function subscribeAdminEvents(
  onRoomsUpdate: (rooms: AdminRoomSummary[]) => void,
): Promise<[Error | null, (() => void) | null]> {
  return api.sse('/admin/events', null, ([eventError, message]) => {
    if (eventError || !message) return;
    if (message.type !== 'admin_rooms_update') return;
    onRoomsUpdate(message.data);
  });
}
