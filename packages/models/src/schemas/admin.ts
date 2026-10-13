import * as z from 'zod/mini';
import { roomTypeSchema } from './room';

export const adminRoomSummaryV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    userCount: z.number(),
    activeSources: z.array(z.string()),
    hasAdminPassword: z.boolean(),
    roomType: z._default(roomTypeSchema, 'MUSIC'),
    isPublic: z.boolean(),
    playlistItemCount: z.number(),
  }),
);
export type AdminRoomSummaryV2 = z.infer<typeof adminRoomSummaryV2Schema>;

export const adminRoomsV2Schema = /* @__PURE__ */ z.compile(
  z.array(adminRoomSummaryV2Schema),
);
export type AdminRoomsV2 = z.infer<typeof adminRoomsV2Schema>;

export const adminRoomResultV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    rooms: adminRoomsV2Schema,
    from: z.number(),
    to: z.number(),
    total: z.number(),
    count: z.number(),
  }),
);
export type AdminRoomResultV2 = z.infer<typeof adminRoomResultV2Schema>;

export const adminRoomSearchV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    q: z.optional(z.string()),
    sortBy: z.optional(z.enum(['listeners', 'playlistItems'])),
    order: z.optional(z.enum(['asc', 'desc'])),
    from: z.optional(z.int().check(z.minimum(0))),
    to: z.optional(z.int().check(z.minimum(0))),
  }),
);

export const adminLoginRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    username: z.string(),
    password: z.string(),
  }),
);
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;

export const adminUserSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    username: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUsersSchema = /* @__PURE__ */ z.compile(
  z.array(adminUserSchema),
);
export type AdminUsers = z.infer<typeof adminUsersSchema>;

export const adminCreateUserRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    username: z.string(),
    password: z.string(),
  }),
);
export type AdminCreateUserRequest = z.infer<
  typeof adminCreateUserRequestSchema
>;

export const adminUpdateUserRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    password: z.string(),
  }),
);
export type AdminUpdateUserRequest = z.infer<
  typeof adminUpdateUserRequestSchema
>;

export const adminUpdateRoomRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    name: z.optional(z.string()),
    clearAdminPassword: z.optional(z.boolean()),
  }),
);
export type AdminUpdateRoomRequest = z.infer<
  typeof adminUpdateRoomRequestSchema
>;

export const adminSessionResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    authorized: z.boolean(),
    user: z.optional(adminUserSchema),
  }),
);
export type AdminSessionResponse = z.infer<typeof adminSessionResponseSchema>;

export const adminSearchUsagePointSchema = /* @__PURE__ */ z.compile(
  z.object({
    window: z.enum(['hour', 'day']),
    timestamp: z.string(),
    provider: z.string(),
    total: z.number(),
    unique: z.number(),
    cached: z.number(),
    live: z.number(),
  }),
);
export type AdminSearchUsagePoint = z.infer<typeof adminSearchUsagePointSchema>;

export const adminSearchUsageSchema = /* @__PURE__ */ z.compile(
  z.object({
    roomPoints: z.optional(
      z.array(
        z.object({
          ...z.omit(adminSearchUsagePointSchema, {
            unique: true,
          }).shape,
          roomId: z.string(),
          roomType: z.optional(z.enum(['MUSIC', 'WATCH'])),
        }),
      ),
    ),
    points: z.array(adminSearchUsagePointSchema),
    generatedAt: z.string(),
  }),
);
export type AdminSearchUsage = z.infer<typeof adminSearchUsageSchema>;

export const listenerUsagePointSchema = /* @__PURE__ */ z.compile(
  z.object({
    window: z.enum(['hour', 'day', 'week', 'month']),
    timestamp: z.string(),
    listeners: z.number(),
  }),
);
export type ListenerUsagePoint = z.infer<typeof listenerUsagePointSchema>;

export const adminListenerUsageSchema = /* @__PURE__ */ z.compile(
  z.object({
    roomPoints: z.optional(
      z.array(
        z.object({
          ...listenerUsagePointSchema.shape,
          roomId: z.string(),
          roomType: z.optional(z.enum(['MUSIC', 'WATCH'])),
        }),
      ),
    ),
    points: z.array(listenerUsagePointSchema),
    generatedAt: z.string(),
  }),
);
export type AdminListenerUsage = z.infer<typeof adminListenerUsageSchema>;

export const adminMessageUsageSchema = /* @__PURE__ */ z.compile(
  z.object({
    roomPoints: z.optional(
      z.array(
        z.object({
          roomId: z.string(),
          roomType: z.optional(z.enum(['MUSIC', 'WATCH'])),
          window: z.enum(['hour', 'day', 'month']),
          timestamp: z.string(),
          messages: z.number(),
        }),
      ),
    ),
    roomId: z.string(),
    total: z.number(),
    generatedAt: z.string(),
    points: z.array(
      z.object({
        window: z.enum(['hour', 'day', 'month']),
        timestamp: z.string(),
        messages: z.number(),
      }),
    ),
  }),
);
export type AdminMessageUsage = z.infer<typeof adminMessageUsageSchema>;

export const adminMessageUsageSearchSchema = /* @__PURE__ */ z.compile(
  z.object({
    roomId: z.optional(z.string().check(z.maxLength(200))),
  }),
);

export const optionalAdminMessageUsageSearchSchema = /* @__PURE__ */ z.compile(
  z.optional(adminMessageUsageSearchSchema),
);
