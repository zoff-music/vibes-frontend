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
import type { ApiClient, ApiResult } from '../index';

export interface RoomReadRequests {
  fetchRoom: (roomId: string) => ApiResult<Room>;
  fetchSongs: (roomId: string) => ApiResult<Song[]>;
}

export function createRoomReadRequests(client: ApiClient): RoomReadRequests {
  return {
    fetchRoom: (roomId: string) => client.get('/rooms/{id}', { id: roomId }),
    fetchSongs: (roomId: string) =>
      client.get('/rooms/{id}/songs', { id: roomId }),
  };
}

export interface RoomDiscoveryRequests {
  fetchProviders: () => ApiResult<Providers>;
  fetchPublicRooms: () => ApiResult<PublicRoom[]>;
}

export function createRoomDiscoveryRequests(
  client: ApiClient,
): RoomDiscoveryRequests {
  return {
    fetchProviders: () => client.get('/providers', null),
    fetchPublicRooms: () => client.get('/rooms/public', null),
  };
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

export function createRoomLifecycleRequests(
  client: ApiClient,
): RoomLifecycleRequests {
  return {
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
  };
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

export function createRoomPlaybackRequests(
  client: ApiClient,
): RoomPlaybackRequests {
  return {
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
  };
}

export interface RoomQueueRequests {
  generatePlaylist: (
    roomId: string,
    request: GeneratedPlaylistRequest,
  ) => ApiResult<RoomGenerationUpdate>;
  removeSong: (roomId: string, songId: string) => ApiResult<EmptyObject>;
  vote: (roomId: string, songId: string) => ApiResult<EmptyObject>;
}

export function createRoomQueueRequests(client: ApiClient): RoomQueueRequests {
  return {
    generatePlaylist: (roomId: string, request: GeneratedPlaylistRequest) =>
      client.post('/rooms/{id}/generations', { id: roomId }, request),
    removeSong: (roomId: string, songId: string) =>
      client.delete('/rooms/{id}/songs/{songId}', { id: roomId, songId }),
    vote: (roomId: string, songId: string) =>
      client.post('/rooms/{id}/songs/{songId}', { id: roomId, songId }, {}),
  };
}

export interface CastingRequests {
  createCastingToken: (roomId: string) => ApiResult<CastingTokenResponse>;
}

export function createCastingRequests(client: ApiClient): CastingRequests {
  return {
    createCastingToken: (roomId: string) =>
      client.post('/tokens/casting', null, { roomId }),
  };
}
