import * as yup from 'yup';

export const adminRoomSummarySchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  userCount: yup.number().required(),
  songCount: yup.number().required(),
  activeSources: yup.array(yup.string().required()).required(),
  hasAdminPassword: yup.boolean().required(),
});
export type AdminRoomSummary = yup.InferType<typeof adminRoomSummarySchema>;

export const adminRoomsSchema = yup.array(adminRoomSummarySchema).required();
export type AdminRooms = yup.InferType<typeof adminRoomsSchema>;

export const adminLoginRequestSchema = yup.object({
  password: yup.string().required(),
});
export type AdminLoginRequest = yup.InferType<typeof adminLoginRequestSchema>;

export const adminUpdateRoomRequestSchema = yup.object({
  name: yup.string().optional(),
  clearAdminPassword: yup.boolean().optional(),
});
export type AdminUpdateRoomRequest = yup.InferType<
  typeof adminUpdateRoomRequestSchema
>;

export const adminSessionResponseSchema = yup.object({
  authorized: yup.boolean().required(),
});
export type AdminSessionResponse = yup.InferType<
  typeof adminSessionResponseSchema
>;
