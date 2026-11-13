import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api, getHttpError } from '@vibes/api';
import type { PublicRoomV3 } from '@vibes/models';
import { readRecentRooms } from '../../utils/recentRooms';
import { clearRoomReminder, readRoomReminder } from '../../utils/roomReminder';
import { canOfferRoomReminder } from '../../utils/roomReminderNavigation';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  if (new URL(request.url).searchParams.get('view') === 'history') {
    return loadRecentRoomDetails(request);
  }

  const roomId = readRoomReminder();

  if (!roomId) return { room: null };

  const navigation = performance.getEntriesByType('navigation')[0];

  if (
    !canOfferRoomReminder({
      navigationType:
        navigation instanceof PerformanceNavigationTiming
          ? navigation.type
          : 'navigate',
      origin: window.location.origin,
      referrer: document.referrer,
    })
  ) {
    clearRoomReminder(roomId);

    return { room: null };
  }

  const options = { retry: 0, signal: request.signal };
  const [roomResult, playbackResult] = await Promise.all([
    api.v2.get('/rooms/{id}', { id: roomId }, options),
    api.v2.get('/rooms/{id}/states', { id: roomId }, options),
  ]);
  const [roomError, room] = roomResult;
  const [playbackError, playback] = playbackResult;

  if (roomError || !room) {
    if (roomError && getHttpError(roomError)?.response.status === 404) {
      clearRoomReminder(roomId);
    }

    return { room: null };
  }

  if (playbackError || !playback || readRoomReminder() !== roomId)
    return { room: null };

  return {
    room: {
      id: room.id,
      name: room.name,
      listenerCount: room.userCount ?? 0,
      playlistItem: playback.currentPlaylistItem,
      isPlaying: playback.isPlaying,
    },
  };
}

async function loadRecentRoomDetails(request: Request) {
  const recent = readRecentRooms(document.cookie);
  const options = { retry: 0, signal: request.signal };
  const rooms = await Promise.all(
    recent.map(async ({ id }): Promise<PublicRoomV3 | null> => {
      const [roomResult, itemsResult] = await Promise.all([
        api.v2.get('/rooms/{id}', { id }, options),
        api.v3.get(
          '/rooms/{id}/items',
          { id, $search: { from: 1, to: 1 } },
          options,
        ),
      ]);
      const [roomError, room] = roomResult;
      const [itemsError, items] = itemsResult;
      if (roomError || !room || itemsError || !items) return null;
      return {
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        listenerCount: room.userCount ?? 0,
        playlistItemCount: items.total,
      };
    }),
  );
  return {
    room: null,
    rooms: rooms.filter((room): room is PublicRoomV3 => room !== null),
  };
}
