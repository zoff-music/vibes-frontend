import { z } from 'zod';
import { roomTypeSchema } from './room';

export const adminRoomSummaryV2Schema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    userCount: z.number(),
    activeSources: z.array(z.string()),
    hasAdminPassword: z.boolean(),
    roomType: roomTypeSchema.default('MUSIC'),
    isPublic: z.boolean(),
    playlistItemCount: z.number(),
  }),
);
export type AdminRoomSummaryV2 = z.infer<typeof adminRoomSummaryV2Schema>;

export const adminRoomsV2Schema = z.compile(z.array(adminRoomSummaryV2Schema));
export type AdminRoomsV2 = z.infer<typeof adminRoomsV2Schema>;

export const adminRoomResultV2Schema = z.compile(
  z.object({
    rooms: adminRoomsV2Schema,
    from: z.number(),
    to: z.number(),
    total: z.number(),
    count: z.number(),
  }),
);
export type AdminRoomResultV2 = z.infer<typeof adminRoomResultV2Schema>;

export const adminRoomSearchV2Schema = z.compile(
  z.object({
    q: z.string().optional(),
    sortBy: z.enum(['listeners', 'playlistItems']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    from: z.int().min(0).optional(),
    to: z.int().min(0).optional(),
  }),
);

export const adminLoginRequestSchema = z.compile(
  z.object({ username: z.string(), password: z.string() }),
);
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;

export const adminUserSchema = z.compile(
  z.object({
    id: z.string(),
    username: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUsersSchema = z.compile(z.array(adminUserSchema));
export type AdminUsers = z.infer<typeof adminUsersSchema>;

export const adminCreateUserRequestSchema = z.compile(
  z.object({ username: z.string(), password: z.string() }),
);
export type AdminCreateUserRequest = z.infer<
  typeof adminCreateUserRequestSchema
>;

export const adminUpdateUserRequestSchema = z.compile(
  z.object({ password: z.string() }),
);
export type AdminUpdateUserRequest = z.infer<
  typeof adminUpdateUserRequestSchema
>;

export const adminUpdateRoomRequestSchema = z.compile(
  z.object({
    name: z.string().optional(),
    clearAdminPassword: z.boolean().optional(),
  }),
);
export type AdminUpdateRoomRequest = z.infer<
  typeof adminUpdateRoomRequestSchema
>;

export const adminSessionResponseSchema = z.compile(
  z.object({ authorized: z.boolean(), user: adminUserSchema.optional() }),
);
export type AdminSessionResponse = z.infer<typeof adminSessionResponseSchema>;

export const adminSearchUsagePointSchema = z.compile(
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

export const adminSearchUsageSchema = z.compile(
  z.object({
    roomPoints: z
      .array(
        z.object({
          ...adminSearchUsagePointSchema.omit({ unique: true }).shape,
          roomId: z.string(),
          roomType: z.enum(['MUSIC', 'WATCH']).optional(),
        }),
      )
      .optional(),
    points: z.array(adminSearchUsagePointSchema),
    generatedAt: z.string(),
  }),
);
export type AdminSearchUsage = z.infer<typeof adminSearchUsageSchema>;

export const listenerUsagePointSchema = z.compile(
  z.object({
    window: z.enum(['hour', 'day', 'week', 'month']),
    timestamp: z.string(),
    listeners: z.number(),
  }),
);
export type ListenerUsagePoint = z.infer<typeof listenerUsagePointSchema>;

export const adminListenerUsageSchema = z.compile(
  z.object({
    roomPoints: z
      .array(
        z.object({
          ...listenerUsagePointSchema.shape,
          roomId: z.string(),
          roomType: z.enum(['MUSIC', 'WATCH']).optional(),
        }),
      )
      .optional(),
    points: z.array(listenerUsagePointSchema),
    generatedAt: z.string(),
  }),
);
export type AdminListenerUsage = z.infer<typeof adminListenerUsageSchema>;

export const adminMessageUsageSchema = z.compile(
  z.object({
    roomPoints: z
      .array(
        z.object({
          roomId: z.string(),
          roomType: z.enum(['MUSIC', 'WATCH']).optional(),
          window: z.enum(['hour', 'day', 'month']),
          timestamp: z.string(),
          messages: z.number(),
        }),
      )
      .optional(),
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

export const adminMessageUsageSearchSchema = z.compile(
  z.object({ roomId: z.string().max(200).optional() }),
);
