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
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export interface RoomReadRequests {
  fetchRoom: (roomId: string, options?: ApiRequestOptions) => ApiResult<Room>;
  fetchSongs: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<Song[]>;
}

export function createRoomReadRequests(client: ApiClient): RoomReadRequests {
  return {
    fetchRoom: (roomId: string, options?: ApiRequestOptions) =>
      client.get('/rooms/{id}', { id: roomId }, options),
    fetchSongs: (roomId: string, options?: ApiRequestOptions) =>
      client.get('/rooms/{id}/songs', { id: roomId }, options),
  };
}

export interface RoomDiscoveryRequests {
  fetchProviders: (options?: ApiRequestOptions) => ApiResult<Providers>;
  fetchPublicRooms: (options?: ApiRequestOptions) => ApiResult<PublicRoom[]>;
}

export function createRoomDiscoveryRequests(
  client: ApiClient,
): RoomDiscoveryRequests {
  return {
    fetchProviders: (options?: ApiRequestOptions) =>
      client.get('/providers', null, options),
    fetchPublicRooms: (options?: ApiRequestOptions) =>
      client.get('/rooms/public', null, options),
  };
}

export interface RoomLifecycleRequests {
  createGeneratedRoom: (
    request: GeneratedPlaylistRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<CreateRoomResponse>;
  createRoom: (
    request: CreateRoomRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<CreateRoomResponse>;
  joinRoom: (
    roomId: string,
    password?: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SessionResponse>;
  logOutRoomAdmin: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SessionResponse>;
  reserveRoom: (
    name?: string,
    options?: ApiRequestOptions,
  ) => ApiResult<RoomNameReservation>;
  updateRoom: (
    roomId: string,
    room: RoomUpdate,
    options?: ApiRequestOptions,
  ) => ApiResult<Room>;
}

export function createRoomLifecycleRequests(
  client: ApiClient,
): RoomLifecycleRequests {
  return {
    createGeneratedRoom: (
      request: GeneratedPlaylistRequest,
      options?: ApiRequestOptions,
    ) => client.post('/rooms/generation', null, request, options),
    createRoom: (request: CreateRoomRequest, options?: ApiRequestOptions) =>
      client.post('/rooms', null, request, options),
    joinRoom: (roomId: string, password = '', options?: ApiRequestOptions) =>
      client.post(
        '/rooms/{id}/sessions',
        { id: roomId },
        { password },
        options,
      ),
    logOutRoomAdmin: (roomId: string, options?: ApiRequestOptions) =>
      client.delete('/rooms/{id}/sessions', { id: roomId }, options),
    reserveRoom: (name?: string, options?: ApiRequestOptions) =>
      client.post('/rooms/reservations', null, name ? { name } : {}, options),
    updateRoom: (
      roomId: string,
      room: RoomUpdate,
      options?: ApiRequestOptions,
    ) => client.patch('/rooms/{id}/settings', { id: roomId }, room, options),
  };
}

export interface RoomPlaybackRequests {
  fetchPlayback: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<PlaybackState>;
  skip: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SkipActionResponse>;
  updatePlayback: (
    roomId: string,
    action: 'pause' | 'play' | 'seek',
    positionMs?: number,
    options?: ApiRequestOptions,
  ) => ApiResult<PlaybackState>;
}

export function createRoomPlaybackRequests(
  client: ApiClient,
): RoomPlaybackRequests {
  return {
    fetchPlayback: (roomId: string, options?: ApiRequestOptions) =>
      client.get('/rooms/{id}/states', { id: roomId }, options),
    skip: (roomId: string, options?: ApiRequestOptions) =>
      client.post('/rooms/{id}/skips', { id: roomId }, {}, options),
    updatePlayback: (
      roomId: string,
      action: 'pause' | 'play' | 'seek',
      positionMs?: number,
      options?: ApiRequestOptions,
    ) =>
      client.put(
        '/rooms/{id}/states',
        { id: roomId },
        { action, ...(positionMs === undefined ? {} : { positionMs }) },
        options,
      ),
  };
}

export interface RoomQueueRequests {
  generatePlaylist: (
    roomId: string,
    request: GeneratedPlaylistRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<RoomGenerationUpdate>;
  removeSong: (
    roomId: string,
    songId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
  vote: (
    roomId: string,
    songId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
}

export function createRoomQueueRequests(client: ApiClient): RoomQueueRequests {
  return {
    generatePlaylist: (
      roomId: string,
      request: GeneratedPlaylistRequest,
      options?: ApiRequestOptions,
    ) =>
      client.post('/rooms/{id}/generations', { id: roomId }, request, options),
    removeSong: (roomId: string, songId: string, options?: ApiRequestOptions) =>
      client.delete(
        '/rooms/{id}/songs/{songId}',
        { id: roomId, songId },
        options,
      ),
    vote: (roomId: string, songId: string, options?: ApiRequestOptions) =>
      client.post(
        '/rooms/{id}/songs/{songId}',
        { id: roomId, songId },
        {},
        options,
      ),
  };
}

export interface CastingRequests {
  createCastingToken: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<CastingTokenResponse>;
}

export function createCastingRequests(client: ApiClient): CastingRequests {
  return {
    createCastingToken: (roomId: string, options?: ApiRequestOptions) =>
      client.post('/tokens/casting', null, { roomId }, options),
  };
}
