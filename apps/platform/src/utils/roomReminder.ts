import { safeWrap } from '@vibes/shared';

const STORAGE_KEY = 'zoff:room-reminder';

export function readRoomReminder() {
  const [error, roomId] = safeWrap(() => localStorage.getItem(STORAGE_KEY));
  return error ? null : roomId;
}

export function rememberRoom(roomId: string) {
  safeWrap(() => localStorage.setItem(STORAGE_KEY, roomId));
}

export function clearRoomReminder(roomId: string) {
  if (readRoomReminder() !== roomId) return;
  safeWrap(() => localStorage.removeItem(STORAGE_KEY));
}
