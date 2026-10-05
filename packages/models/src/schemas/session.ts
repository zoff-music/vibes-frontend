import { z } from 'zod';
import { roomSchema, roomV2Schema } from './room';

export const displayNameMaxLength = 30;

export const roomUserSchema = z.compile(
  z.object({
    id: z.string(),
    nickname: z.string().nullable().optional(),
    isAdmin: z.boolean(),
    joinedAt: z.string(),
    lastSeenAt: z.string(),
  }),
);
export type RoomUser = z.infer<typeof roomUserSchema>;

/** @deprecated V1 session response. Use sessionResponseV2Schema for current clients. */
export const sessionResponseSchema = z.compile(
  z.object({
    userId: z.string(),
    sessionId: z.string(),
    nickname: z.string().nullable().optional(),
    isAdmin: z.boolean(),
    room: roomSchema,
  }),
);
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export const sessionResponseV2Schema = z.compile(
  sessionResponseSchema.extend({ room: roomV2Schema }),
);
export type SessionResponseV2 = z.infer<typeof sessionResponseV2Schema>;

export const createSessionRequestSchema = z.compile(
  z.object({
    nickname: z.string().optional(),
    password: z.string().optional(),
  }),
);
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const sessionProfileSchema = z.compile(z.object({ name: z.string() }));
export type SessionProfile = z.infer<typeof sessionProfileSchema>;

export const updateSessionProfileRequestSchema = z.compile(
  z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter a name.')
      .max(displayNameMaxLength, 'Names can be at most 30 characters.'),
  }),
);
export type UpdateSessionProfileRequest = z.infer<
  typeof updateSessionProfileRequestSchema
>;
