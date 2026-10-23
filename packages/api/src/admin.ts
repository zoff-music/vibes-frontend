import {
  adminCreateUserRequestSchema,
  adminListenerUsageSchema,
  adminLoginRequestSchema,
  adminMessageUsageSchema,
  adminRoomChangeSchema,
  adminRoomResultV2Schema,
  adminRoomSearchV2Schema,
  adminRoomSummaryV2Schema,
  adminRoomsV2Schema,
  adminSearchUsageSchema,
  adminSessionResponseSchema,
  adminUpdateRoomRequestSchema,
  adminUpdateUserRequestSchema,
  adminUserSchema,
  adminUsersSchema,
  connectedSchema,
  emptyObjectSchema,
  optionalAdminMessageUsageSearchSchema,
  roomTypeQuerySchema,
  sessionProfileSchema,
  statsV2Schema,
  updateSessionProfileRequestSchema,
} from '@vibes/models';
import type { RequestDefinitions } from 'wiretyped';
import {
  API_BASE_URL,
  type ApiClientOptions,
  createRequestClient,
} from './client';

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
  '/admin/messages/usage': {
    get: {
      $search: optionalAdminMessageUsageSearchSchema,
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
} as const satisfies RequestDefinitions;

const v2Endpoints = {
  '/stats': {
    get: { $search: roomTypeQuerySchema, response: statsV2Schema },
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
} as const satisfies RequestDefinitions;

const v3Endpoints = {
  '/admin/events': {
    sse: {
      events: {
        admin_rooms_update: adminRoomsV2Schema,
        admin_room_update: adminRoomSummaryV2Schema,
        admin_room_removed: adminRoomChangeSchema,
      },
    },
  },
} as const satisfies RequestDefinitions;

export function createAdminApiClientWithBaseUrl(
  baseUrl: string,
  options: ApiClientOptions = {},
) {
  const origin = baseUrl.replace(/\/api\/v1$/, '');
  const client = createRequestClient(origin, '/api/v1', endpoints, options);

  return Object.assign(client, {
    v2: createRequestClient(origin, '/api/v2', v2Endpoints, options),
    v3: createRequestClient(origin, '/api/v3', v3Endpoints, options),
  });
}

export const adminApi =
  /* @__PURE__ */ createAdminApiClientWithBaseUrl(API_BASE_URL);
