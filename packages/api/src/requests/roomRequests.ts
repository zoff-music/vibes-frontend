import type {
  CastingTokenResponse,
  CreateRoomRequestV2,
  CreateRoomResponse,
  EmptyObject,
  GeneratedPlaylistRequest,
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  PublicRoomV3,
  RoomGenerationUpdate,
  RoomNameReservation,
  RoomUpdateV2,
  RoomV2,
  SessionResponseV2,
  SkipPlaylistItemResponse,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export interface RoomReadRequests {
  fetchRoom: (roomId: string, options?: ApiRequestOptions) => ApiResult<RoomV2>;
  fetchPlaylistItems: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<PlaylistItem[]>;
}

export function createRoomReadRequests(client: ApiClient): RoomReadRequests {
  return {
    fetchRoom: (roomId: string, options?: ApiRequestOptions) =>
      client.v2.get('/rooms/{id}', { id: roomId }, options),
    fetchPlaylistItems: (roomId: string, options?: ApiRequestOptions) =>
      client.v2.get('/rooms/{id}/playlist-items', { id: roomId }, options),
  };
}

export interface RoomDiscoveryRequests {
  fetchProviders: (options?: ApiRequestOptions) => ApiResult<Providers>;
  fetchPublicRooms: (options?: ApiRequestOptions) => ApiResult<PublicRoomV3[]>;
}

export function createRoomDiscoveryRequests(
  client: ApiClient,
): RoomDiscoveryRequests {
  return {
    fetchProviders: (options?: ApiRequestOptions) =>
      client.get('/providers', null, options),
    fetchPublicRooms: async (options?: ApiRequestOptions) => {
      const [error, result] = await client.v3.get(
        '/rooms/public',
        { $search: { live: true, from: 0, to: 5 } },
        options,
      );
      if (error) return [error, null];

      return [null, result.rooms];
    },
  };
}

export interface RoomLifecycleRequests {
  createGeneratedRoom: (
    request: GeneratedPlaylistRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<CreateRoomResponse>;
  createRoom: (
    request: CreateRoomRequestV2,
    options?: ApiRequestOptions,
  ) => ApiResult<CreateRoomResponse>;
  joinRoom: (
    roomId: string,
    password?: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SessionResponseV2>;
  logOutRoomAdmin: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SessionResponseV2>;
  reserveRoom: (
    name?: string,
    options?: ApiRequestOptions,
  ) => ApiResult<RoomNameReservation>;
  updateRoom: (
    roomId: string,
    room: RoomUpdateV2,
    options?: ApiRequestOptions,
  ) => ApiResult<RoomV2>;
}

export function createRoomLifecycleRequests(
  client: ApiClient,
): RoomLifecycleRequests {
  return {
    createGeneratedRoom: (
      request: GeneratedPlaylistRequest,
      options?: ApiRequestOptions,
    ) => client.v2.post('/rooms/generation', null, request, options),
    createRoom: (request: CreateRoomRequestV2, options?: ApiRequestOptions) =>
      client.v2.post('/rooms', null, request, options),
    joinRoom: (roomId: string, password = '', options?: ApiRequestOptions) =>
      client.v2.post(
        '/rooms/{id}/sessions',
        { id: roomId },
        { password },
        options,
      ),
    logOutRoomAdmin: (roomId: string, options?: ApiRequestOptions) =>
      client.v2.delete('/rooms/{id}/sessions', { id: roomId }, options),
    reserveRoom: (name?: string, options?: ApiRequestOptions) =>
      client.post('/rooms/reservations', null, name ? { name } : {}, options),
    updateRoom: (
      roomId: string,
      room: RoomUpdateV2,
      options?: ApiRequestOptions,
    ) => client.v2.patch('/rooms/{id}/settings', { id: roomId }, room, options),
  };
}

export interface RoomPlaybackRequests {
  fetchPlayback: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<PlaybackStateV2>;
  skip: (
    roomId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<SkipPlaylistItemResponse>;
  updatePlayback: (
    roomId: string,
    action: 'pause' | 'play' | 'seek',
    positionMs?: number,
    options?: ApiRequestOptions,
  ) => ApiResult<PlaybackStateV2>;
}

export function createRoomPlaybackRequests(
  client: ApiClient,
): RoomPlaybackRequests {
  return {
    fetchPlayback: (roomId: string, options?: ApiRequestOptions) =>
      client.v2.get('/rooms/{id}/states', { id: roomId }, options),
    skip: (roomId: string, options?: ApiRequestOptions) =>
      client.v2.post('/rooms/{id}/skips', { id: roomId }, {}, options),
    updatePlayback: (
      roomId: string,
      action: 'pause' | 'play' | 'seek',
      positionMs?: number,
      options?: ApiRequestOptions,
    ) =>
      client.v2.put(
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
  removePlaylistItem: (
    roomId: string,
    playlistItemId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
  vote: (
    roomId: string,
    playlistItemId: string,
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
    removePlaylistItem: (
      roomId: string,
      playlistItemId: string,
      options?: ApiRequestOptions,
    ) =>
      client.v2.delete(
        '/rooms/{id}/playlist-items/{playlistItemId}',
        { id: roomId, playlistItemId },
        options,
      ),
    vote: (
      roomId: string,
      playlistItemId: string,
      options?: ApiRequestOptions,
    ) =>
      client.v2.post(
        '/rooms/{id}/playlist-items/{playlistItemId}',
        { id: roomId, playlistItemId },
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
