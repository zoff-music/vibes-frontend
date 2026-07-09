/// <reference types="vite/client" />
// Global type declaration for Node.js process in browser-oriented builds.
declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

import {
  addSongRequestSchema,
  adminLoginRequestSchema,
  adminRoomsSchema,
  adminSessionResponseSchema,
  castingTokenResponseSchema,
  connectedSchema,
  createCastingTokenRequestSchema,
  createRoomRequestSchema,
  createSessionRequestSchema,
  emptyObjectSchema,
  messageResponseSchema,
  playbackStateSchema,
  providersSchema,
  providerTokenSchema,
  roomActionRequestSchema,
  roomSchema,
  roomUpdateSchema,
  searchQuerySchema,
  searchResponseSchema,
  sessionResponseSchema,
  skipActionResponseSchema,
  skipVoteUpdateSchema,
  songSchema,
  songsListSchema,
  spotifyTokenSchema,
  sseQuerySchema,
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
  type ApiFetchLifecycle,
  createApiFetchProvider,
} from './fetchProvider';

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
  if (typeof window !== 'undefined') {
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
      response: roomSchema,
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
      response: songSchema,
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
  '/casting/tokens': {
    post: {
      request: createCastingTokenRequestSchema,
      response: castingTokenResponseSchema,
    },
  },
  '/admin/sessions': {
    post: {
      request: adminLoginRequestSchema,
      response: adminSessionResponseSchema,
    },
    delete: {
      response: adminSessionResponseSchema,
    },
  },
  '/admin/rooms': {
    get: {
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
  '/soundcloud/search': {
    get: {
      $search: searchQuerySchema,
      response: searchResponseSchema,
    },
  },
} as const satisfies RequestDefinitions;

export interface ApiClientOptions {
  customHeaders?: Record<string, string>;
  fetchLifecycle?: ApiFetchLifecycle;
}

function resolveApiBaseUrl(baseUrl: string) {
  const normalized = baseUrl.endsWith(API_BASE_PATH)
    ? baseUrl
    : `${baseUrl}${API_BASE_PATH}`;
  return normalized.replace(/([^:]\/)\/+/g, '$1');
}

export function createApiClientWithBaseUrl(
  baseUrl: string,
  options: ApiClientOptions = {},
) {
  const { customHeaders = {}, fetchLifecycle } = options;
  const resolvedBaseUrl = resolveApiBaseUrl(baseUrl);
  return new RequestClient({
    ...(fetchLifecycle && {
      fetchProvider: createApiFetchProvider(fetchLifecycle),
    }),
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
}

export function createApiClient(customHeaders: Record<string, string> = {}) {
  return createApiClientWithBaseUrl(API_URL, { customHeaders });
}

export const api = createApiClient();

// Endpoint helpers (mirrors backend handler filenames)
export * from './casting';
export * from './hooks/useAdminEvents';
export * from './hooks/useAuthCache';
export * from './hooks/useMusicSearch';
// Hooks
export * from './hooks/usePlayback';
export * from './hooks/useProviderToken';
export * from './hooks/useQueue';
export * from './hooks/useRoom';
export * from './hooks/useSSE';
