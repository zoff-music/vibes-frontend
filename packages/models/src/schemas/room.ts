import * as yup from 'yup';
import { sourceTypeSchema } from './songs';

export const roomSettingsSchema = yup.object({
  skipAllowed: yup.boolean().required(),
  democraticSkip: yup.boolean().required(),
  skipVoteThreshold: yup.number().required(),
  maxContinuousAdds: yup.number().required(),
  removeOnPlay: yup.boolean().required(),
  loopQueue: yup.boolean().required(),
  allowDuplicates: yup.boolean().required(),
  enabledSources: yup.array(sourceTypeSchema.required()).required(),
  onlyAdminAddSongs: yup.boolean().optional(),
  public: yup.boolean().required(),
});
export type RoomSettings = yup.InferType<typeof roomSettingsSchema>;

export const roomSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  mode: yup
    .string()
    .transform((value) => (!value ? 'server' : value))
    .oneOf(['server', 'host'])
    .default('server'),
  hostId: yup.string().nullable().optional(),
  createdAt: yup.string().required(),
  hasPassword: yup.boolean().required(),
  settings: roomSettingsSchema.required(),
  userCount: yup.number().optional(),
  userId: yup.string().optional(),
  isAdmin: yup.boolean().optional(),
  activeSources: yup.array(sourceTypeSchema.required()).optional(),
  isGenerating: yup.boolean().default(false),
  generationCount: yup.number().integer().min(0).default(0),
  roomGenerationMaxDailyCount: yup.number().integer().min(1).required(),
  roomGenerationMaxExistingSongs: yup.number().integer().min(0).required(),
  generationError: yup.string().optional(),
});
export type Room = yup.InferType<typeof roomSchema>;

export const roomHostUpdateSchema = yup.object({
  userId: yup.string().required(),
  message: yup.string().required(),
});
export type RoomHostUpdate = yup.InferType<typeof roomHostUpdateSchema>;

export const roomNameReservationSchema = yup.object({
  name: yup.string().required(),
  token: yup.string().required(),
  expiresAt: yup.string().required(),
});
export type RoomNameReservation = yup.InferType<
  typeof roomNameReservationSchema
>;

export const roomNameReservationRequestSchema = yup.object({
  name: yup.string().optional(),
});
export type RoomNameReservationRequest = yup.InferType<
  typeof roomNameReservationRequestSchema
>;

export const usersUpdateSchema = yup.number().required();

export const createRoomRequestSchema = yup.object({
  name: yup.string().required(),
  mode: yup.string().oneOf(['server', 'host']).optional(),
  password: yup.string().optional(),
  reservationToken: yup.string().optional(),
  settings: roomSettingsSchema.partial().optional(),
});
export type CreateRoomRequest = yup.InferType<typeof createRoomRequestSchema>;

export const createRoomResponseSchema = yup.object({
  id: yup.string().required(),
});
export type CreateRoomResponse = yup.InferType<typeof createRoomResponseSchema>;

export const roomUpdateSchema = yup.object({
  name: yup.string().optional(),
  mode: yup.string().oneOf(['server', 'host']).optional(),
  settings: roomSettingsSchema.partial().optional(),
});
export type RoomUpdate = yup.InferType<typeof roomUpdateSchema>;

export const publicRoomSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  listenerCount: yup.number().integer().min(1).required(),
  songCount: yup.number().integer().min(0).required(),
});
export type PublicRoom = yup.InferType<typeof publicRoomSchema>;

export const publicRoomsSchema = yup.array(publicRoomSchema).required();
