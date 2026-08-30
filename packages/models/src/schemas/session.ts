import { z } from 'zod';
import { roomSchema } from './room';

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
  z.object({ name: z.string().trim().min(1).max(30) }),
);
export type UpdateSessionProfileRequest = z.infer<
  typeof updateSessionProfileRequestSchema
>;
