import * as z from 'zod/mini';
import { roomV2Schema } from './room';

export const displayNameMaxLength = 30;

export const roomUserSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    nickname: z.optional(z.nullable(z.string())),
    isAdmin: z.boolean(),
    joinedAt: z.string(),
    lastSeenAt: z.string(),
  }),
);
export type RoomUser = z.infer<typeof roomUserSchema>;

export const sessionResponseV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    userId: z.string(),
    sessionId: z.string(),
    nickname: z.optional(z.nullable(z.string())),
    isAdmin: z.boolean(),
    room: roomV2Schema,
  }),
);
export type SessionResponseV2 = z.infer<typeof sessionResponseV2Schema>;

export const createSessionRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    nickname: z.optional(z.string()),
    password: z.optional(z.string()),
  }),
);
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const sessionProfileSchema = /* @__PURE__ */ z.compile(
  z.object({
    name: z.string(),
  }),
);
export type SessionProfile = z.infer<typeof sessionProfileSchema>;

export const updateSessionProfileRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    name: z
      .string()
      .check(
        z.trim(),
        z.minLength(1, 'Enter a name.'),
        z.maxLength(
          displayNameMaxLength,
          'Names can be at most 30 characters.',
        ),
      ),
  }),
);
export type UpdateSessionProfileRequest = z.infer<
  typeof updateSessionProfileRequestSchema
>;
