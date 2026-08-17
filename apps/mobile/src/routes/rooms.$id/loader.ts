import { createRoomPlaybackRequests, createRoomReadRequests } from '@vibes/api';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const readRequests = createRoomReadRequests(mobileApi);
const playbackRequests = createRoomPlaybackRequests(mobileApi);

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<RoomSnapshot>> {
  const roomId = params.id;
  if (!roomId) return { data: null, error: 'A room is required.' };
  const [roomResult, songsResult, playbackResult] = await Promise.all([
    readRequests.fetchRoom(roomId, { signal }),
    readRequests.fetchSongs(roomId, { signal }),
    playbackRequests.fetchPlayback(roomId, { signal }),
  ]);
  const error = roomResult[0] ?? songsResult[0] ?? playbackResult[0];
  if (error || !roomResult[1] || !songsResult[1] || !playbackResult[1]) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not refresh room.'),
    };
  }
  return {
    data: {
      playback: playbackResult[1],
      room: roomResult[1],
      songs: songsResult[1],
    },
    error: '',
  };
}
