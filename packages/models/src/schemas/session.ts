import * as v from 'valibot';
import { displayNameMaxLength } from '../limits';
import { objectInputSchema } from './object-input';
import { roomV2Schema } from './room';

export const roomUserSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  nickname: v.optional(v.nullable(v.string())),
  isAdmin: v.boolean(),
  joinedAt: v.string(),
  lastSeenAt: v.string(),
});

export type RoomUser = v.InferOutput<typeof roomUserSchema>;

export const sessionResponseV2Schema = /* @__PURE__ */ v.object({
  userId: v.string(),
  sessionId: v.string(),
  nickname: v.optional(v.nullable(v.string())),
  isAdmin: v.boolean(),
  room: roomV2Schema,
});

export type SessionResponseV2 = v.InferOutput<typeof sessionResponseV2Schema>;

export const createSessionRequestSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    nickname: v.optional(v.string()),
    password: v.optional(v.string()),
  }),
);

export type CreateSessionRequest = v.InferOutput<
  typeof createSessionRequestSchema
>;

export const sessionProfileSchema = /* @__PURE__ */ v.object({
  name: v.string(),
});

export type SessionProfile = v.InferOutput<typeof sessionProfileSchema>;

export const updateSessionProfileRequestSchema = /* @__PURE__ */ v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Enter a name.'),
    v.maxLength(displayNameMaxLength, 'Names can be at most 30 characters.'),
  ),
});

export type UpdateSessionProfileRequest = v.InferOutput<
  typeof updateSessionProfileRequestSchema
>;
