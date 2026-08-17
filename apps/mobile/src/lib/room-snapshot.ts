import type {
  ApiResult,
  RoomPlaybackRequests,
  RoomReadRequests,
} from '@vibes/api';
import type { PlaybackState, Room, Song } from '@vibes/models';

export interface RoomSnapshot {
  playback: PlaybackState;
  room: Room;
  songs: Song[];
}

export async function fetchRoomSnapshot(
  roomId: string,
  readRequests: RoomReadRequests,
  playbackRequests: RoomPlaybackRequests,
): ApiResult<RoomSnapshot> {
  const results = await Promise.all([
    readRequests.fetchRoom(roomId),
    readRequests.fetchSongs(roomId),
    playbackRequests.fetchPlayback(roomId),
  ]);
  const [roomError, room] = results[0];
  const [songsError, songs] = results[1];
  const [playbackError, playback] = results[2];
  const error = roomError ?? songsError ?? playbackError;
  if (error) return [error, null];
  if (!room || !songs || !playback) {
    return [new Error('Incomplete room snapshot'), null];
  }
  return [null, { playback, room, songs }];
}
