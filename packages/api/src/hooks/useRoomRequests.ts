import type {
  CastingTokenResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  EmptyObject,
  PlaybackState,
  Providers,
  PublicRoom,
  Room,
  RoomNameReservation,
  RoomUpdate,
  SessionResponse,
  SkipActionResponse,
  Song,
} from '@vibes/models';
import { useMemo } from 'react';
import type { ApiClient, ApiResult } from '../index';

export interface RoomSnapshot {
  playback: PlaybackState;
  room: Room;
  songs: Song[];
}

export interface RoomRequests {
  createCastingToken: (roomId: string) => ApiResult<CastingTokenResponse>;
  createRoom: (request: CreateRoomRequest) => ApiResult<CreateRoomResponse>;
  fetchProviders: () => ApiResult<Providers>;
  fetchPublicRooms: () => ApiResult<PublicRoom[]>;
  fetchSnapshot: (roomId: string) => ApiResult<RoomSnapshot>;
  joinRoom: (roomId: string, password?: string) => ApiResult<SessionResponse>;
  removeSong: (roomId: string, songId: string) => ApiResult<EmptyObject>;
  reserveRoom: (name: string) => ApiResult<RoomNameReservation>;
  skip: (roomId: string) => ApiResult<SkipActionResponse>;
  updatePlayback: (
    roomId: string,
    action: 'pause' | 'play' | 'seek',
    positionMs?: number,
  ) => ApiResult<PlaybackState>;
  updateRoom: (roomId: string, room: RoomUpdate) => ApiResult<Room>;
  vote: (roomId: string, songId: string) => ApiResult<EmptyObject>;
}

export function useRoomRequests(client: ApiClient): RoomRequests {
  return useMemo(
    () => ({
      createRoom: (request: CreateRoomRequest) =>
        client.post('/rooms', null, request),
      fetchProviders: () => client.get('/providers', null),
      fetchPublicRooms: () => client.get('/rooms/public', null),
      fetchSnapshot: async (roomId: string) => {
        const [
          [roomError, room],
          [songsError, songs],
          [playbackError, playback],
        ] = await Promise.all([
          client.get('/rooms/{id}', { id: roomId }),
          client.get('/rooms/{id}/songs', { id: roomId }),
          client.get('/rooms/{id}/states', { id: roomId }),
        ]);
        const error = roomError ?? songsError ?? playbackError;
        if (error) return [error, null] as const;
        if (!room || !songs || !playback) {
          return [
            new Error('error loading incomplete room snapshot'),
            null,
          ] as const;
        }
        return [null, { playback, room, songs }] as const;
      },
      joinRoom: (roomId: string, password = '') =>
        client.post('/rooms/{id}/sessions', { id: roomId }, { password }),
      reserveRoom: (name: string) =>
        client.post('/rooms/reservations', null, { name }),
      removeSong: (roomId: string, songId: string) =>
        client.delete('/rooms/{id}/songs/{songId}', { id: roomId, songId }),
      skip: (roomId: string) =>
        client.post('/rooms/{id}/skips', { id: roomId }, {}),
      updatePlayback: (
        roomId: string,
        action: 'pause' | 'play' | 'seek',
        positionMs?: number,
      ) =>
        client.put(
          '/rooms/{id}/states',
          { id: roomId },
          { action, ...(positionMs === undefined ? {} : { positionMs }) },
        ),
      updateRoom: (roomId: string, room: RoomUpdate) =>
        client.patch('/rooms/{id}/settings', { id: roomId }, room),
      vote: (roomId: string, songId: string) =>
        client.post('/rooms/{id}/songs/{songId}', { id: roomId, songId }, {}),
      createCastingToken: (roomId: string) =>
        client.post('/tokens/casting', null, { roomId }),
    }),
    [client],
  );
}
