/// <reference types="vite/client" />
// Global type declaration for Node.js process in browser-oriented builds.
declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

import {
  addPlaylistItemRequestSchema,
  addPlaylistItemResponseSchema,
  addPlaylistRequestSchema,
  addPlaylistRequestV2Schema,
  addPlaylistResponseSchema,
  addSongRequestSchema,
  addSongResponseSchema,
  adminCreateUserRequestSchema,
  adminListenerUsageSchema,
  adminLoginRequestSchema,
  adminMessageUsageSchema,
  adminMessageUsageSearchSchema,
  adminRoomResultSchema,
  adminRoomResultV2Schema,
  adminRoomSearchSchema,
  adminRoomSearchV2Schema,
  adminRoomsSchema,
  adminRoomsV2Schema,
  adminSearchUsageSchema,
  adminSessionResponseSchema,
  adminUpdateRoomRequestSchema,
  adminUpdateUserRequestSchema,
  adminUserSchema,
  adminUsersSchema,
  castingTokenResponseSchema,
  connectedSchema,
  createCastingTokenRequestSchema,
  createMessageSchema,
  createRoomRequestSchema,
  createRoomRequestV2Schema,
  createRoomResponseSchema,
  createSessionRequestSchema,
  emptyObjectSchema,
  eventCursorSchema,
  generatedPlaylistRequestSchema,
  generatedRoomRequestV2Schema,
  messageResponseSchema,
  musicPlaylistSchema,
  playbackFailureRequestSchema,
  playbackFailureRequestV2Schema,
  playbackStateSchema,
  playbackStateV2Schema,
  playlistItemIdUpdateSchema,
  playlistItemPositionUpdateSchema,
  playlistItemSchema,
  playlistItemsListSchema,
  providerItemSchema,
  providerPlaylistSchema,
  providerSearchResponseSchema,
  providersSchema,
  providerTokenSchema,
  providerURLQuerySchema,
  publicRoomResultSchema,
  publicRoomResultV3Schema,
  publicRoomSearchSchema,
  publicRoomsSchema,
  remoteEventSchema,
  remoteEventV2Schema,
  remotePairingRequestSchema,
  remotePairingSchema,
  remotePairingV2Schema,
  remoteSessionSchema,
  remoteSessionV2Schema,
  remoteStatusSchema,
  remoteStatusV2Schema,
  remoteUpdateRequestSchema,
  remoteUpdateRequestV2Schema,
  roomActionRequestSchema,
  roomGenerationUpdateSchema,
  roomHostUpdateSchema,
  roomMessageSchema,
  roomNameReservationRequestSchema,
  roomNameReservationSchema,
  roomSchema,
  roomTypeQuerySchema,
  roomUpdateSchema,
  roomUpdateV2Schema,
  roomV2Schema,
  searchQuerySchema,
  searchResponseSchema,
  searchResultSchema,
  sessionProfileSchema,
  sessionResponseSchema,
  sessionResponseV2Schema,
  skipActionResponseSchema,
  skipPlaylistItemResponseSchema,
  skipVoteUpdateSchema,
  skipVoteUpdateV2Schema,
  songIdUpdateSchema,
  songPositionUpdateSchema,
  songSchema,
  songsListSchema,
  sseQuerySchema,
  statsSchema,
  statsV2Schema,
  updateSessionProfileRequestSchema,
  usersUpdateSchema,
  youTubeSearchQuerySchema,
  youTubeSearchResponseSchema,
  youTubeVideoSchema,
} from '@vibes/models';

import {
  getHttpError,
  RequestClient,
  type RequestDefinitions,
} from 'wiretyped';

import {
  type ApiFetch,
  type ApiFetchLifecycle,
  type ApiHeadOptions,
  createApiFetchProvider,
  headApiUrl,
} from './fetchProvider';

export type { ApiFetchLifecycle };
export { getHttpError };

const API_BASE_PATH = '/api/v1';
const API_V2_BASE_PATH = '/api/v2';
const API_V3_BASE_PATH = '/api/v3';
const defaultRestTimeoutMs = 10_000;

function readEnvValue(name: string) {
  const runtimeValue =
    typeof process !== 'undefined' ? process.env?.[name] : undefined;
  if (runtimeValue) {
    return runtimeValue;
  }

  if (import.meta?.env?.[name]) {
    return import.meta.env[name];
  }

  return undefined;
}

function getRestTimeoutMs() {
  const rawTimeout =
    readEnvValue('VITE_API_REST_TIMEOUT_MS') ??
    readEnvValue('API_REST_TIMEOUT_MS');
  if (rawTimeout === 'false') {
    return false;
  }

  const parsed = Number.parseInt(rawTimeout ?? '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return defaultRestTimeoutMs;
}

function getApiUrl() {
  // If explicitly set via runtime env var (e.g. in SSR), use it first
  const runtimeApiUrl = readEnvValue('VITE_API_URL');
  if (runtimeApiUrl) {
    return runtimeApiUrl;
  }

  // If in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, origin } = window.location;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // If using HTTPS locally (likely via Caddy/reverse proxy)
      // We assume the proxy handles the /api/* routing to the backend
      if (protocol === 'https:') {
        return origin;
      }
      // If using HTTP locally (likely direct dev server)
      // We assume backend is on standard 8080
      return 'http://localhost:8080';
    }

    // Production/Deployed: use the same origin
    return origin;
  }

  // Fallback for non-browser environments
  return 'http://localhost:8080';
}

const API_URL = getApiUrl();
export const API_BASE_URL = `${API_URL}${API_BASE_PATH}`.replace(
  /([^:]\/)\/+/g,
  '$1',
); // Remove double slashes except after protocol

const endpoints = {
  '/sessions': {
    get: {
      response: sessionProfileSchema,
    },
    patch: {
      request: updateSessionProfileRequestSchema,
      response: sessionProfileSchema,
    },
  },
  '/rooms': {
    post: {
      request: createRoomRequestSchema,
      response: createRoomResponseSchema,
    },
  },
  '/rooms/suggestions': {
    get: {
      response: roomNameReservationSchema,
    },
  },
  '/rooms/public': {
    get: {
      response: publicRoomsSchema,
    },
  },
  '/rooms/reservations': {
    post: {
      request: roomNameReservationRequestSchema,
      response: roomNameReservationSchema,
    },
  },
  '/rooms/{id}': {
    get: {
      response: roomSchema,
    },
    post: {
      request: roomActionRequestSchema,
      response: playbackStateSchema,
    },
  },
  '/rooms/{id}/settings': {
    patch: {
      request: roomUpdateSchema,
      response: roomSchema,
    },
  },
  '/rooms/{id}/skips': {
    post: {
      response: skipActionResponseSchema,
    },
  },

  '/rooms/{id}/states': {
    get: {
      response: playbackStateSchema,
    },
    put: {
      request: roomActionRequestSchema,
      response: playbackStateSchema,
    },
  },
  '/rooms/{id}/playbackfailures': {
    post: {
      request: playbackFailureRequestSchema,
      response: playbackStateSchema,
    },
  },
  '/rooms/{id}/sessions': {
    post: {
      request: createSessionRequestSchema,
      response: sessionResponseSchema,
    },
    delete: {
      response: sessionResponseSchema,
    },
  },
  '/rooms/{id}/songs': {
    get: {
      response: songsListSchema,
    },
    post: {
      request: addSongRequestSchema,
      response: addSongResponseSchema,
    },
  },
  '/rooms/{id}/songs/{songId}': {
    delete: {
      response: emptyObjectSchema,
    },
    post: {
      response: emptyObjectSchema,
    },
  },
  '/rooms/{id}/playlists': {
    post: {
      request: addPlaylistRequestSchema,
      response: addPlaylistResponseSchema,
    },
  },
  '/rooms/generation': {
    post: {
      request: generatedPlaylistRequestSchema,
      response: roomSchema,
    },
  },
  '/rooms/{id}/generations': {
    post: {
      request: generatedPlaylistRequestSchema,
      response: roomGenerationUpdateSchema,
    },
  },

  '/youtube/search': {
    get: {
      $search: youTubeSearchQuerySchema,
      response: youTubeSearchResponseSchema,
    },
  },
  '/youtube/videos/{id}': {
    get: {
      response: youTubeVideoSchema,
    },
  },
  '/youtube/playlists/{id}': {
    get: {
      response: musicPlaylistSchema,
    },
  },
  '/soundcloud/playlists': {
    get: {
      $search: providerURLQuerySchema,
      response: musicPlaylistSchema,
    },
  },
  '/rooms/{id}/messages': {
    post: { request: createMessageSchema, response: roomMessageSchema },
    sse: {
      $search: sseQuerySchema.optional(),
      events: {
        message: roomMessageSchema,
        settings_activity: roomMessageSchema,
        event_cursor: eventCursorSchema,
      },
    },
  },
  '/rooms/{id}/events': {
    sse: {
      $search: sseQuerySchema.optional(),
      events: {
        connected: connectedSchema,
        event_cursor: eventCursorSchema,
        playback_update: playbackStateSchema,
        songs_update: songsListSchema,
        song_added: songSchema,
        skip_vote: skipVoteUpdateSchema,
        settings_update: roomSchema,
        users_update: usersUpdateSchema,
        generation_update: roomGenerationUpdateSchema,
        new_host: roomHostUpdateSchema,
      },
    },
  },

  '/tokens/{provider}': {
    get: {
      response: providerTokenSchema,
    },
  },
  '/authorizations/youtube': {
    get: {
      response: messageResponseSchema,
    },
  },
  '/authorizations/soundcloud': {
    get: {
      response: messageResponseSchema,
    },
  },
  '/providers': {
    get: {
      response: providersSchema,
    },
  },
  '/stats': {
    get: {
      response: statsSchema,
    },
  },
  '/tokens/casting': {
    post: {
      request: createCastingTokenRequestSchema,
      response: castingTokenResponseSchema,
    },
  },
  '/remotes': {
    get: {
      response: remoteStatusSchema,
    },
    post: {
      request: remoteUpdateRequestSchema,
      response: remotePairingSchema,
    },
  },
  '/remotes/{id}': {
    get: {
      response: remoteStatusSchema,
    },
    patch: {
      request: remoteUpdateRequestSchema,
      response: emptyObjectSchema,
    },
    delete: {
      response: emptyObjectSchema,
    },
  },
  '/remotes/{id}/sessions': {
    post: {
      request: remotePairingRequestSchema,
      response: remoteSessionSchema,
    },
  },
  '/remotes/{id}/events': {
    sse: {
      events: {
        remote_room_update: remoteEventSchema,
        remote_state_update: remoteEventSchema,
      },
    },
  },
  '/admin/sessions': {
    get: {
      response: adminSessionResponseSchema,
    },
    post: {
      request: adminLoginRequestSchema,
      response: adminSessionResponseSchema,
    },
    delete: {
      response: adminSessionResponseSchema,
    },
  },
  '/admin/users': {
    get: {
      response: adminUsersSchema,
    },
    post: {
      request: adminCreateUserRequestSchema,
      response: adminUserSchema,
    },
  },
  '/admin/users/{id}': {
    patch: {
      request: adminUpdateUserRequestSchema,
      response: emptyObjectSchema,
    },
    delete: {
      response: emptyObjectSchema,
    },
  },
  '/admin/rooms': {
    get: {
      $search: adminRoomSearchSchema,
      response: adminRoomResultSchema,
    },
  },
  '/admin/messages/usage': {
    get: {
      $search: adminMessageUsageSearchSchema.optional(),
      response: adminMessageUsageSchema,
    },
  },
  '/admin/searches/usage': {
    get: {
      response: adminSearchUsageSchema,
    },
  },
  '/admin/listeners/usage': {
    get: {
      response: adminListenerUsageSchema,
    },
  },
  '/admin/rooms/{id}': {
    patch: {
      request: adminUpdateRoomRequestSchema,
      response: adminRoomsSchema,
    },
    delete: {
      response: adminRoomsSchema,
    },
  },
  '/admin/events': {
    sse: {
      events: {
        connected: connectedSchema,
        admin_rooms_update: adminRoomsSchema,
      },
    },
  },
  '/soundcloud/search': {
    get: {
      $search: searchQuerySchema,
      response: searchResponseSchema,
    },
  },
  '/soundcloud/tracks': {
    get: {
      $search: providerURLQuerySchema,
      response: searchResultSchema,
    },
  },
} as const satisfies RequestDefinitions;

const v2Endpoints = {
  '/rooms': {
    post: { request: createRoomRequestV2Schema, response: roomV2Schema },
  },
  '/rooms/{id}': {
    get: { response: roomV2Schema },
  },
  '/rooms/{id}/settings': {
    patch: { request: roomUpdateV2Schema, response: roomV2Schema },
  },
  '/rooms/{id}/sessions': {
    post: {
      request: createSessionRequestSchema,
      response: sessionResponseV2Schema,
    },
    delete: { response: sessionResponseV2Schema },
  },
  '/rooms/{id}/states': {
    get: { response: playbackStateV2Schema },
    put: { request: roomActionRequestSchema, response: playbackStateV2Schema },
  },
  '/rooms/{id}/skips': {
    post: { response: skipPlaylistItemResponseSchema },
  },
  '/rooms/{id}/failures': {
    post: {
      request: playbackFailureRequestV2Schema,
      response: playbackStateV2Schema,
    },
  },
  '/rooms/{id}/playlist-items': {
    get: { response: playlistItemsListSchema },
    post: {
      request: addPlaylistItemRequestSchema,
      response: addPlaylistItemResponseSchema,
    },
  },
  '/rooms/{id}/playlist-items/{playlistItemId}': {
    post: { response: emptyObjectSchema },
    delete: { response: emptyObjectSchema },
  },
  '/rooms/{id}/playlists': {
    post: {
      request: addPlaylistRequestV2Schema,
      response: addPlaylistResponseSchema,
    },
  },
  '/rooms/generation': {
    post: { request: generatedRoomRequestV2Schema, response: roomV2Schema },
  },
  '/rooms/{id}/search/{provider}': {
    get: { $search: searchQuerySchema, response: providerSearchResponseSchema },
  },
  '/youtube/videos/{id}': {
    get: { response: providerItemSchema },
  },
  '/youtube/playlists/{id}': {
    get: { $search: roomTypeQuerySchema, response: providerPlaylistSchema },
  },
  '/soundcloud/items': {
    get: { $search: providerURLQuerySchema, response: providerItemSchema },
  },
  '/soundcloud/items/{id}': {
    get: { response: providerItemSchema },
  },
  '/soundcloud/playlists': {
    get: { $search: providerURLQuerySchema, response: providerPlaylistSchema },
  },
  '/stats': {
    get: { response: statsV2Schema },
  },
  '/remotes': {
    get: { response: remoteStatusV2Schema },
    post: {
      request: remoteUpdateRequestV2Schema,
      response: remotePairingV2Schema,
    },
  },
  '/remotes/{id}': {
    get: { response: remoteStatusV2Schema },
    patch: {
      request: remoteUpdateRequestV2Schema,
      response: emptyObjectSchema,
    },
  },
  '/remotes/{id}/sessions': {
    post: {
      request: remotePairingRequestSchema,
      response: remoteSessionV2Schema,
    },
  },
  '/remotes/{id}/events': {
    sse: {
      events: {
        remote_room_update: remoteEventV2Schema,
        remote_state_update: remoteEventV2Schema,
      },
    },
  },
  '/admin/rooms': {
    get: {
      $search: adminRoomSearchV2Schema,
      response: adminRoomResultV2Schema,
    },
  },
  '/admin/rooms/{id}': {
    patch: {
      request: adminUpdateRoomRequestSchema,
      response: adminRoomsV2Schema,
    },
    delete: { response: adminRoomsV2Schema },
  },
  '/admin/events': {
    sse: {
      events: {
        connected: connectedSchema,
        admin_rooms_update: adminRoomsV2Schema,
      },
    },
  },
  '/rooms/public': {
    get: {
      $search: publicRoomSearchSchema,
      response: publicRoomResultSchema,
    },
  },
  '/rooms/{id}/events': {
    sse: {
      $search: sseQuerySchema.optional(),
      events: {
        connected: connectedSchema,
        event_cursor: eventCursorSchema,
        playback_update: playbackStateSchema,
        songs_snapshot: songsListSchema,
        song_added: songSchema,
        song_updated: songPositionUpdateSchema,
        song_removed: songIdUpdateSchema,
        skip_vote: skipVoteUpdateSchema,
        settings_update: roomSchema,
        users_update: usersUpdateSchema,
        generation_update: roomGenerationUpdateSchema,
        new_host: roomHostUpdateSchema,
      },
    },
  },
} as const satisfies RequestDefinitions;

const v3Endpoints = {
  '/rooms/public': {
    get: {
      $search: publicRoomSearchSchema,
      response: publicRoomResultV3Schema,
    },
  },
  '/rooms/{id}/events': {
    sse: {
      $search: sseQuerySchema.optional(),
      events: {
        connected: connectedSchema,
        event_cursor: eventCursorSchema,
        playback_update: playbackStateV2Schema,
        playlist_items_snapshot: playlistItemsListSchema,
        playlist_item_added: playlistItemSchema,
        playlist_item_updated: playlistItemPositionUpdateSchema,
        playlist_item_removed: playlistItemIdUpdateSchema,
        skip_vote: skipVoteUpdateV2Schema,
        settings_update: roomV2Schema,
        users_update: usersUpdateSchema,
        generation_update: roomGenerationUpdateSchema,
        new_host: roomHostUpdateSchema,
      },
    },
  },
} as const satisfies RequestDefinitions;

export interface ApiClientOptions {
  customHeaders?: Record<string, string>;
  fetcher?: ApiFetch;
  fetchLifecycle?: ApiFetchLifecycle;
}

export type RoomExistsOptions = ApiHeadOptions;

export type ApiResult<Data> = Promise<
  [error: Error, data: null] | [error: null, data: Data]
>;

export interface ApiRequestOptions {
  signal?: AbortSignal;
}

export type ApiClient = RequestClient<typeof endpoints> & {
  v2: ApiV2Client;
  v3: ApiV3Client;
  roomExists: (
    roomID: string,
    options?: RoomExistsOptions,
  ) => Promise<[Error | null, boolean | null]>;
};

export type ApiV2Client = RequestClient<typeof v2Endpoints>;
export type ApiV3Client = RequestClient<typeof v3Endpoints>;

function resolveApiBaseUrl(baseUrl: string) {
  const normalized = baseUrl.endsWith(API_BASE_PATH)
    ? baseUrl
    : `${baseUrl}${API_BASE_PATH}`;
  return normalized.replace(/([^:]\/)\/+/g, '$1');
}

export function createApiClientWithBaseUrl(
  baseUrl: string,
  options: ApiClientOptions = {},
): ApiClient {
  const { customHeaders = {}, fetcher, fetchLifecycle } = options;
  const resolvedBaseUrl = resolveApiBaseUrl(baseUrl);
  const requestClient = new RequestClient({
    fetchProvider: createApiFetchProvider(fetchLifecycle, fetcher),
    hostname: resolvedBaseUrl,
    baseUrl: resolvedBaseUrl,
    endpoints,
    validation: true,
    fetchOpts: {
      timeout: getRestTimeoutMs(),
      credentials: 'include',
      headers: { ...customHeaders },
    },
  });

  return Object.assign(requestClient, {
    v2: createApiV2ClientWithBaseUrl(
      resolvedBaseUrl.slice(0, -API_BASE_PATH.length),
      options,
    ),
    v3: createApiV3ClientWithBaseUrl(
      resolvedBaseUrl.slice(0, -API_BASE_PATH.length),
      options,
    ),
    roomExists: (roomID: string, roomExistsOptions: RoomExistsOptions = {}) => {
      const roomURL = `${resolvedBaseUrl}/rooms/${encodeURIComponent(roomID)}`;
      return headApiUrl(
        roomURL,
        {
          ...roomExistsOptions,
          headers: {
            ...customHeaders,
            ...roomExistsOptions.headers,
          },
        },
        fetchLifecycle,
        fetcher,
      );
    },
  });
}

export function createApiClient(customHeaders: Record<string, string> = {}) {
  return createApiClientWithBaseUrl(API_URL, { customHeaders });
}

export const api = createApiClient();

export function createApiV2ClientWithBaseUrl(
  baseUrl: string,
  options: ApiClientOptions = {},
): ApiV2Client {
  const { customHeaders = {}, fetcher, fetchLifecycle } = options;
  const normalizedBaseUrl = baseUrl.endsWith(API_V2_BASE_PATH)
    ? baseUrl
    : `${baseUrl}${API_V2_BASE_PATH}`;
  const resolvedBaseUrl = normalizedBaseUrl.replace(/([^:]\/)\/+/g, '$1');

  return new RequestClient({
    fetchProvider: createApiFetchProvider(fetchLifecycle, fetcher),
    hostname: resolvedBaseUrl,
    baseUrl: resolvedBaseUrl,
    endpoints: v2Endpoints,
    validation: true,
    fetchOpts: {
      timeout: getRestTimeoutMs(),
      credentials: 'include',
      headers: { ...customHeaders },
    },
  });
}

export function createApiV2Client(
  customHeaders: Record<string, string> = {},
): ApiV2Client {
  return createApiV2ClientWithBaseUrl(API_URL, { customHeaders });
}

export const apiV2 = createApiV2Client();

export function createApiV3ClientWithBaseUrl(
  baseUrl: string,
  options: ApiClientOptions = {},
): ApiV3Client {
  const { customHeaders = {}, fetcher, fetchLifecycle } = options;
  const normalizedBaseUrl = baseUrl.endsWith(API_V3_BASE_PATH)
    ? baseUrl
    : `${baseUrl}${API_V3_BASE_PATH}`;
  const resolvedBaseUrl = normalizedBaseUrl.replace(/([^:]\/)\/+/g, '$1');

  return new RequestClient({
    fetchProvider: createApiFetchProvider(fetchLifecycle, fetcher),
    hostname: resolvedBaseUrl,
    baseUrl: resolvedBaseUrl,
    endpoints: v3Endpoints,
    validation: true,
    fetchOpts: {
      timeout: getRestTimeoutMs(),
      credentials: 'include',
      headers: { ...customHeaders },
    },
  });
}

export function createApiV3Client(
  customHeaders: Record<string, string> = {},
): ApiV3Client {
  return createApiV3ClientWithBaseUrl(API_URL, { customHeaders });
}

export const apiV3 = createApiV3Client();
