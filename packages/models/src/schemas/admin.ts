import * as v from 'valibot';
import { objectInputSchema } from './object-input';
import { roomTypeSchema } from './room';

export const adminRoomSummaryV2Schema = /* @__PURE__ */ v.object({
  id: v.string(),
  name: v.string(),
  userCount: v.pipe(v.number(), v.finite()),
  activeSources: v.array(v.string()),
  hasAdminPassword: v.boolean(),
  roomType: v.optional(roomTypeSchema, 'MUSIC'),
  isPublic: v.boolean(),
  playlistItemCount: v.pipe(v.number(), v.finite()),
});

export type AdminRoomSummaryV2 = v.InferOutput<typeof adminRoomSummaryV2Schema>;

export const adminRoomsV2Schema = /* @__PURE__ */ v.array(
  adminRoomSummaryV2Schema,
);

export type AdminRoomsV2 = v.InferOutput<typeof adminRoomsV2Schema>;

export const adminRoomResultV2Schema = /* @__PURE__ */ v.object({
  rooms: adminRoomsV2Schema,
  from: v.pipe(v.number(), v.finite()),
  to: v.pipe(v.number(), v.finite()),
  total: v.pipe(v.number(), v.finite()),
  count: v.pipe(v.number(), v.finite()),
});

export type AdminRoomResultV2 = v.InferOutput<typeof adminRoomResultV2Schema>;

export const adminRoomSearchV2Schema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    q: v.optional(v.string()),
    sortBy: v.optional(v.picklist(['listeners', 'playlistItems'])),
    order: v.optional(v.picklist(['asc', 'desc'])),
    from: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(0))),
    to: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(0))),
  }),
);

export const adminLoginRequestSchema = /* @__PURE__ */ v.object({
  username: v.string(),
  password: v.string(),
});

export type AdminLoginRequest = v.InferOutput<typeof adminLoginRequestSchema>;

export const adminUserSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  username: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export type AdminUser = v.InferOutput<typeof adminUserSchema>;

export const adminUsersSchema = /* @__PURE__ */ v.array(adminUserSchema);

export type AdminUsers = v.InferOutput<typeof adminUsersSchema>;

export const adminCreateUserRequestSchema = /* @__PURE__ */ v.object({
  username: v.string(),
  password: v.string(),
});

export type AdminCreateUserRequest = v.InferOutput<
  typeof adminCreateUserRequestSchema
>;

export const adminUpdateUserRequestSchema = /* @__PURE__ */ v.object({
  password: v.string(),
});

export type AdminUpdateUserRequest = v.InferOutput<
  typeof adminUpdateUserRequestSchema
>;

export const adminUpdateRoomRequestSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    name: v.optional(v.string()),
    clearAdminPassword: v.optional(v.boolean()),
  }),
);

export type AdminUpdateRoomRequest = v.InferOutput<
  typeof adminUpdateRoomRequestSchema
>;

export const adminSessionResponseSchema = /* @__PURE__ */ v.object({
  authorized: v.boolean(),
  user: v.optional(adminUserSchema),
});

export type AdminSessionResponse = v.InferOutput<
  typeof adminSessionResponseSchema
>;

export const adminSearchUsagePointSchema = /* @__PURE__ */ v.object({
  window: v.picklist(['hour', 'day']),
  timestamp: v.string(),
  provider: v.string(),
  total: v.pipe(v.number(), v.finite()),
  unique: v.pipe(v.number(), v.finite()),
  cached: v.pipe(v.number(), v.finite()),
  live: v.pipe(v.number(), v.finite()),
});

export type AdminSearchUsagePoint = v.InferOutput<
  typeof adminSearchUsagePointSchema
>;

export const adminSearchUsageSchema = /* @__PURE__ */ v.object({
  roomPoints: v.optional(
    v.array(
      v.object({
        ...v.omit(adminSearchUsagePointSchema, ['unique']).entries,
        roomId: v.string(),
        roomType: v.optional(v.picklist(['MUSIC', 'WATCH'])),
      }),
    ),
  ),
  points: v.array(adminSearchUsagePointSchema),
  generatedAt: v.string(),
});

export type AdminSearchUsage = v.InferOutput<typeof adminSearchUsageSchema>;

export const listenerUsagePointSchema = /* @__PURE__ */ v.object({
  window: v.picklist(['hour', 'day', 'week', 'month']),
  timestamp: v.string(),
  listeners: v.pipe(v.number(), v.finite()),
});

export type ListenerUsagePoint = v.InferOutput<typeof listenerUsagePointSchema>;

export const adminListenerUsageSchema = /* @__PURE__ */ v.object({
  roomPoints: v.optional(
    v.array(
      v.object({
        ...listenerUsagePointSchema.entries,
        roomId: v.string(),
        roomType: v.optional(v.picklist(['MUSIC', 'WATCH'])),
      }),
    ),
  ),
  points: v.array(listenerUsagePointSchema),
  generatedAt: v.string(),
});

export type AdminListenerUsage = v.InferOutput<typeof adminListenerUsageSchema>;

export const adminMessageUsageSchema = /* @__PURE__ */ v.object({
  roomPoints: v.optional(
    v.array(
      v.object({
        roomId: v.string(),
        roomType: v.optional(v.picklist(['MUSIC', 'WATCH'])),
        window: v.picklist(['hour', 'day', 'month']),
        timestamp: v.string(),
        messages: v.pipe(v.number(), v.finite()),
      }),
    ),
  ),
  roomId: v.string(),
  total: v.pipe(v.number(), v.finite()),
  generatedAt: v.string(),
  points: v.array(
    v.object({
      window: v.picklist(['hour', 'day', 'month']),
      timestamp: v.string(),
      messages: v.pipe(v.number(), v.finite()),
    }),
  ),
});

export type AdminMessageUsage = v.InferOutput<typeof adminMessageUsageSchema>;

export const adminMessageUsageSearchSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    roomId: v.optional(v.pipe(v.string(), v.maxLength(200))),
  }),
);

export const optionalAdminMessageUsageSearchSchema = /* @__PURE__ */ v.optional(
  adminMessageUsageSearchSchema,
);
