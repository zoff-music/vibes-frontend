/// <reference types="vite/client" />
// Global type declaration for Node.js process in browser-oriented builds.
declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

import {
  addPlaylistRequestSchema,
  addPlaylistResponseSchema,
  addSongRequestSchema,
  addSongResponseSchema,
  adminCreateUserRequestSchema,
  adminListenerUsageSchema,
  adminLoginRequestSchema,
  adminRoomResultSchema,
  adminRoomSearchSchema,
  adminRoomsSchema,
  adminSearchUsageSchema,
  adminSessionResponseSchema,
  adminUpdateRoomRequestSchema,
  adminUpdateUserRequestSchema,
  adminUserSchema,
  adminUsersSchema,
  castingTokenResponseSchema,
  connectedSchema,
  createCastingTokenRequestSchema,
  createRoomRequestSchema,
  createRoomResponseSchema,
  createSessionRequestSchema,
  emptyObjectSchema,
  generatedPlaylistRequestSchema,
  messageResponseSchema,
  musicPlaylistSchema,
  playbackFailureRequestSchema,
  playbackStateSchema,
  providersSchema,
  providerTokenSchema,
  providerURLQuerySchema,
  publicRoomsSchema,
  remoteEventSchema,
  remotePairingRequestSchema,
  remotePairingSchema,
  remoteSessionSchema,
  remoteStatusSchema,
  remoteUpdateRequestSchema,
  roomActionRequestSchema,
  roomGenerationUpdateSchema,
  roomHostUpdateSchema,
  roomNameReservationRequestSchema,
  roomNameReservationSchema,
  roomSchema,
  roomUpdateSchema,
  searchQuerySchema,
  searchResponseSchema,
  searchResultSchema,
  sessionResponseSchema,
  skipActionResponseSchema,
  skipVoteUpdateSchema,
  songSchema,
  songsListSchema,
  spotifyTokenSchema,
  sseQuerySchema,
  statsSchema,
  usersUpdateSchema,
  youTubeSearchQuerySchema,
  youTubeSearchResponseSchema,
  youTubeVideoSchema,
} from '@vibes/models';

export * as yup from 'yup';

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
  '/spotify/playlists/{id}': {
    get: {
      response: musicPlaylistSchema,
    },
  },
  '/rooms/{id}/events': {
    sse: {
      $search: sseQuerySchema.optional(),
      events: {
        connected: connectedSchema,
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
  '/authorizations/spotify/token': {
    get: {
      response: spotifyTokenSchema,
    },
  },
  '/authorizations/spotify': {
    get: {
      response: messageResponseSchema,
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
  '/spotify/search': {
    get: {
      $search: searchQuerySchema,
      response: searchResponseSchema,
    },
  },
  '/spotify/tracks/{id}': {
    get: {
      response: searchResultSchema,
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

export interface ApiClientOptions {
  customHeaders?: Record<string, string>;
  fetcher?: ApiFetch;
  fetchLifecycle?: ApiFetchLifecycle;
}

export type RoomExistsOptions = ApiHeadOptions;

export type ApiResult<Data> = Promise<
  [error: Error, data: null] | [error: null, data: Data]
>;

export type ApiClient = RequestClient<typeof endpoints> & {
  roomExists: (
    roomID: string,
    options?: RoomExistsOptions,
  ) => Promise<[Error | null, boolean | null]>;
};

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

// Endpoint helpers (mirrors backend handler filenames)
export * from './casting';
export * from './hooks/useAdminEvents';
export * from './hooks/useProviderRequests';
export * from './hooks/useRemoteEvents';
export * from './hooks/useRemoteRequests';
export * from './hooks/useRoomRequests';
// Hooks
export * from './hooks/useSSE';
export * from './rateLimit';
