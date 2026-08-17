import {
  createRoomPlaybackRequests,
  createRoomReadRequests,
  getHttpError,
  getRequestErrorMessage,
} from '@vibes/api';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { tvApi } from '@/lib/api';

const readRequests = createRoomReadRequests(tvApi);
const playbackRequests = createRoomPlaybackRequests(tvApi);

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<RoomSnapshot>> {
  const roomId = params.id?.trim().toLowerCase();
  if (!roomId) return { data: null, error: 'Enter a room name.' };
  const results = await Promise.all([
    readRequests.fetchRoom(roomId, { signal }),
    readRequests.fetchSongs(roomId, { signal }),
    playbackRequests.fetchPlayback(roomId, { signal }),
  ]);
  const [roomError, room] = results[0];
  const [songsError, songs] = results[1];
  const [playbackError, playback] = results[2];
  const error = roomError ?? songsError ?? playbackError;
  const snapshot = room && songs && playback ? { playback, room, songs } : null;
  if (error || !snapshot) {
    if (getHttpError(error)?.response.status === notFoundStatus) {
      return { data: null, error: roomNotFoundError };
    }
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not find that room.'),
    };
  }
  return { data: snapshot, error: '' };
}

export const roomNotFoundError = 'ROOM_NOT_FOUND';
const notFoundStatus = 404;
