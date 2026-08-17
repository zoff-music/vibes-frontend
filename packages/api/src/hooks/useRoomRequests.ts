import type {
  CastingTokenResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  EmptyObject,
  GeneratedPlaylistRequest,
  PlaybackState,
  Providers,
  PublicRoom,
  Room,
  RoomGenerationUpdate,
  RoomNameReservation,
  RoomUpdate,
  SessionResponse,
  SkipActionResponse,
  Song,
} from '@vibes/models';
import { useMemo } from 'react';
import type { ApiClient, ApiResult } from '../index';

export interface RoomReadRequests {
  fetchRoom: (roomId: string) => ApiResult<Room>;
  fetchSongs: (roomId: string) => ApiResult<Song[]>;
}

export function useRoomReadRequests(client: ApiClient): RoomReadRequests {
  return useMemo(
    () => ({
      fetchRoom: (roomId: string) => client.get('/rooms/{id}', { id: roomId }),
      fetchSongs: (roomId: string) =>
        client.get('/rooms/{id}/songs', { id: roomId }),
    }),
    [client],
  );
}

export interface RoomDiscoveryRequests {
  fetchProviders: () => ApiResult<Providers>;
  fetchPublicRooms: () => ApiResult<PublicRoom[]>;
}

export function useRoomDiscoveryRequests(
  client: ApiClient,
): RoomDiscoveryRequests {
  return useMemo(
    () => ({
      fetchProviders: () => client.get('/providers', null),
      fetchPublicRooms: () => client.get('/rooms/public', null),
    }),
    [client],
  );
}

export interface RoomLifecycleRequests {
  createGeneratedRoom: (
    request: GeneratedPlaylistRequest,
  ) => ApiResult<CreateRoomResponse>;
  createRoom: (request: CreateRoomRequest) => ApiResult<CreateRoomResponse>;
  joinRoom: (roomId: string, password?: string) => ApiResult<SessionResponse>;
  logOutRoomAdmin: (roomId: string) => ApiResult<SessionResponse>;
  reserveRoom: (name?: string) => ApiResult<RoomNameReservation>;
  updateRoom: (roomId: string, room: RoomUpdate) => ApiResult<Room>;
}

export function useRoomLifecycleRequests(
  client: ApiClient,
): RoomLifecycleRequests {
  return useMemo(
    () => ({
      createGeneratedRoom: (request: GeneratedPlaylistRequest) =>
        client.post('/rooms/generation', null, request),
      createRoom: (request: CreateRoomRequest) =>
        client.post('/rooms', null, request),
      joinRoom: (roomId: string, password = '') =>
        client.post('/rooms/{id}/sessions', { id: roomId }, { password }),
      logOutRoomAdmin: (roomId: string) =>
        client.delete('/rooms/{id}/sessions', { id: roomId }),
      reserveRoom: (name?: string) =>
        client.post('/rooms/reservations', null, name ? { name } : {}),
      updateRoom: (roomId: string, room: RoomUpdate) =>
        client.patch('/rooms/{id}/settings', { id: roomId }, room),
    }),
    [client],
  );
}

export interface RoomPlaybackRequests {
  fetchPlayback: (roomId: string) => ApiResult<PlaybackState>;
  skip: (roomId: string) => ApiResult<SkipActionResponse>;
  updatePlayback: (
    roomId: string,
    action: 'pause' | 'play' | 'seek',
    positionMs?: number,
  ) => ApiResult<PlaybackState>;
}

export function useRoomPlaybackRequests(
  client: ApiClient,
): RoomPlaybackRequests {
  return useMemo(
    () => ({
      fetchPlayback: (roomId: string) =>
        client.get('/rooms/{id}/states', { id: roomId }),
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
    }),
    [client],
  );
}

export interface RoomQueueRequests {
  generatePlaylist: (
    roomId: string,
    request: GeneratedPlaylistRequest,
  ) => ApiResult<RoomGenerationUpdate>;
  removeSong: (roomId: string, songId: string) => ApiResult<EmptyObject>;
  vote: (roomId: string, songId: string) => ApiResult<EmptyObject>;
}

export function useRoomQueueRequests(client: ApiClient): RoomQueueRequests {
  return useMemo(
    () => ({
      generatePlaylist: (roomId: string, request: GeneratedPlaylistRequest) =>
        client.post('/rooms/{id}/generations', { id: roomId }, request),
      removeSong: (roomId: string, songId: string) =>
        client.delete('/rooms/{id}/songs/{songId}', { id: roomId, songId }),
      vote: (roomId: string, songId: string) =>
        client.post('/rooms/{id}/songs/{songId}', { id: roomId, songId }, {}),
    }),
    [client],
  );
}

export interface CastingRequests {
  createCastingToken: (roomId: string) => ApiResult<CastingTokenResponse>;
}

export function useCastingRequests(client: ApiClient): CastingRequests {
  return useMemo(
    () => ({
      createCastingToken: (roomId: string) =>
        client.post('/tokens/casting', null, { roomId }),
    }),
    [client],
  );
}
