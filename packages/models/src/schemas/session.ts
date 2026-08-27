import * as yup from 'yup';
import { roomSchema } from './room';

export const roomUserSchema = yup.object({
  id: yup.string().required(),
  nickname: yup.string().nullable().optional(),
  isAdmin: yup.boolean().required(),
  joinedAt: yup.string().required(),
  lastSeenAt: yup.string().required(),
});
export type RoomUser = yup.InferType<typeof roomUserSchema>;

export const sessionResponseSchema = yup.object({
  userId: yup.string().required(),
  sessionId: yup.string().required(),
  nickname: yup.string().nullable().optional(),
  isAdmin: yup.boolean().required(),
  room: roomSchema.required(),
});
export type SessionResponse = yup.InferType<typeof sessionResponseSchema>;

export const createSessionRequestSchema = yup.object({
  nickname: yup.string().optional(),
  password: yup.string().optional(),
});
export type CreateSessionRequest = yup.InferType<
  typeof createSessionRequestSchema
>;

export const sessionProfileSchema = yup.object({
  name: yup.string().required(),
});
export type SessionProfile = yup.InferType<typeof sessionProfileSchema>;

export const updateSessionProfileRequestSchema = yup.object({
  name: yup.string().trim().min(1).max(30).required(),
});
export type UpdateSessionProfileRequest = yup.InferType<
  typeof updateSessionProfileRequestSchema
>;
