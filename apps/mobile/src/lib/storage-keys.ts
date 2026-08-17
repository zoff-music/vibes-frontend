export const remoteStorageKey = 'zoff.mobile.remote';
export const remoteTokenStorageKey = 'zoff.mobile.remote-token';
export const playerPreferenceStorageKey = 'zoff.mobile.player-enabled';
export const themePreferenceStorageKey = 'zoff.mobile.theme';

const roomAdminPasswordStoragePrefix = 'zoff.mobile.room-admin';

export function getRoomAdminPasswordStorageKey(roomId: string) {
  const encodedRoomId = Array.from(roomId, (character) =>
    character.codePointAt(0)?.toString(16),
  ).join('-');
  return `${roomAdminPasswordStoragePrefix}.${encodedRoomId}`;
}
