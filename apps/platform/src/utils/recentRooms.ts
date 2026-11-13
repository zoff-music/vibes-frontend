import type { PublicRoomV3 } from '@vibes/models';
import { safeWrap } from '@vibes/shared/wrap';
import { ROOM_HISTORY_COOKIE } from '../constants/roomDiscovery.ts';

export interface RecentRoom {
  id: string;
  name: string;
}

export function readRecentRooms(
  cookieHeader: string,
  roomType: PublicRoomV3['roomType'],
): RecentRoom[] {
  const cookieName = `${ROOM_HISTORY_COOKIE}-${roomType.toLowerCase()}`;
  const value = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!value || value.length > 3500) return [];

  const [error, parsed] = safeWrap((): unknown =>
    JSON.parse(decodeURIComponent(value)),
  );
  if (error || !Array.isArray(parsed)) return [];

  const rooms: RecentRoom[] = [];
  const entries: unknown[] = parsed;
  for (const item of entries) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('id' in item) ||
      !('name' in item) ||
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      !item.id ||
      item.id.length > 799 ||
      !item.name ||
      item.name.length > 100 ||
      rooms.some((room) => room.id === item.id)
    )
      continue;
    rooms.push({ id: item.id, name: item.name });
    if (rooms.length === 3) break;
  }
  return rooms;
}

export function rememberRecentRoom(
  room: RecentRoom,
  roomType: PublicRoomV3['roomType'],
) {
  if (typeof document === 'undefined' || !room.id || room.id.length > 799)
    return;

  const cookieName = `${ROOM_HISTORY_COOKIE}-${roomType.toLowerCase()}`;
  safeWrap(() => {
    const recent = [
      { id: room.id, name: room.name.slice(0, 100) },
      ...readRecentRooms(document.cookie, roomType).filter(
        (item) => item.id !== room.id,
      ),
    ].slice(0, 3);
    let value = encodeURIComponent(JSON.stringify(recent));
    while (value.length > 3500 && recent.length > 1) {
      recent.pop();
      value = encodeURIComponent(JSON.stringify(recent));
    }
    if (value.length > 3500) return;
    // biome-ignore lint/suspicious/noDocumentCookie: synchronous write keeps immediate navigation SSR in sync, including older browsers.
    document.cookie = `${cookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  });
}
