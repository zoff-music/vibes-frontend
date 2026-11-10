import {
  createRoomPlaybackRequests,
  createRoomReadRequests,
  getHttpError,
  getRequestErrorMessage,
} from '@vibes/api';
import type { RoomSnapshot } from '@vibes/models';
import type { RequestArgs, RequestResult } from '@vibes/shared/requests';
import { roomNotFoundError } from '@/constants/room';
import { tvApi } from '@/lib/api';

const readRequests = createRoomReadRequests(tvApi);
const playbackRequests = createRoomPlaybackRequests(tvApi);

export async function loadRoom({
  params,
  signal,
}: RequestArgs): Promise<RequestResult<RoomSnapshot>> {
  const roomName = params.id?.trim();

  if (!roomName) return { data: null, error: 'Enter a room name.' };

  const [roomError, room] = await readRequests.resolveRoom(roomName, {
    signal,
  });
  if (roomError || !room) {
    if (getHttpError(roomError)?.response.status === notFoundStatus)
      return { data: null, error: roomNotFoundError };
    return {
      data: null,
      error: await getRequestErrorMessage(
        roomError,
        'Could not find that room.',
      ),
    };
  }
  const [playlistResult, playbackResult] = await Promise.all([
    readRequests.fetchPlaylistItems(room.id, { signal }),
    playbackRequests.fetchPlayback(room.id, { signal }),
  ]);
  const [playlistItemsError, playlistItems] = playlistResult;
  const [playbackError, playback] = playbackResult;
  const error = roomError ?? playlistItemsError ?? playbackError;
  const snapshot =
    room && playlistItems && playback
      ? { playback, room, playlistItems }
      : null;

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

const notFoundStatus = 404;
