import { safeWrap } from '@vibes/shared/wrap';

export interface RecentRoom {
  id: string;
  name: string;
}

const COOKIE_NAME = 'zoff-recent-rooms';

export function readRecentRooms(cookieHeader: string): RecentRoom[] {
  const value = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
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
      item.id.length > 100 ||
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

export function rememberRecentRoom(room: RecentRoom) {
  if (typeof document === 'undefined' || !room.id || room.id.length > 100)
    return;

  safeWrap(() => {
    const recent = [
      { id: room.id, name: room.name.slice(0, 100) },
      ...readRecentRooms(document.cookie).filter((item) => item.id !== room.id),
    ].slice(0, 3);
    let value = encodeURIComponent(JSON.stringify(recent));
    while (value.length > 3500 && recent.length > 1) {
      recent.pop();
      value = encodeURIComponent(JSON.stringify(recent));
    }
    // biome-ignore lint/suspicious/noDocumentCookie: synchronous write keeps immediate navigation SSR in sync, including older browsers.
    document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  });
}
