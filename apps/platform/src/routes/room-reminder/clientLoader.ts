import { api, getHttpError } from '@vibes/api';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { clearRoomReminder, readRoomReminder } from '../../utils/roomReminder';
import { canOfferRoomReminder } from '../../utils/roomReminderNavigation';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
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
    api.get('/rooms/{id}', { id: roomId }, options),
    api.get('/rooms/{id}/states', { id: roomId }, options),
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
      song: playback.currentSong,
      isPlaying: playback.isPlaying,
    },
  };
}
