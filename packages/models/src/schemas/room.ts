import { z } from 'zod';
import { sourceTypeSchema } from './songs';

const roomSettingsShape = {
  skipAllowed: z.boolean(),
  democraticSkip: z.boolean(),
  skipVoteThreshold: z.number(),
  maxContinuousAdds: z.number(),
  removeOnPlay: z.boolean(),
  allowDuplicates: z.boolean(),
  enabledSources: z.array(sourceTypeSchema),
  onlyAdminAddSongs: z.boolean().optional(),
  public: z.boolean(),
  playlistImport: z.boolean(),
};

export const roomSettingsSchema = z.compile(z.object(roomSettingsShape));
export type RoomSettings = z.infer<typeof roomSettingsSchema>;

const roomModeSchema = z.preprocess(
  (value) => value || 'server',
  z.enum(['server', 'host']).default('server'),
);

export const roomSchema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    mode: roomModeSchema,
    hostId: z.string().nullable().optional(),
    createdAt: z.string(),
    hasPassword: z.boolean(),
    settings: roomSettingsSchema,
    userCount: z.number().optional(),
    userId: z.string().optional(),
    isAdmin: z.boolean().optional(),
    activeSources: z.array(sourceTypeSchema).optional(),
    isGenerating: z.boolean().default(false),
    generationCount: z.int().min(0).default(0),
    roomGenerationMaxDailyCount: z.int().min(1),
    roomGenerationMaxExistingSongs: z.int().min(0),
    generationError: z.string().optional(),
  }),
);
export type Room = z.infer<typeof roomSchema>;

export const roomHostUpdateSchema = z.compile(
  z.object({ userId: z.string(), message: z.string() }),
);
export type RoomHostUpdate = z.infer<typeof roomHostUpdateSchema>;

export const roomNameReservationSchema = z.compile(
  z.object({ name: z.string(), token: z.string(), expiresAt: z.string() }),
);
export type RoomNameReservation = z.infer<typeof roomNameReservationSchema>;

export const roomNameReservationRequestSchema = z.compile(
  z.object({ name: z.string().optional() }),
);
export type RoomNameReservationRequest = z.infer<
  typeof roomNameReservationRequestSchema
>;

export const usersUpdateSchema = z.compile(z.number());

const partialRoomSettingsSchema = z.object(roomSettingsShape).partial();

export const createRoomRequestSchema = z.compile(
  z.object({
    name: z.string(),
    mode: z.enum(['server', 'host']).optional(),
    password: z.string().optional(),
    reservationToken: z.string().optional(),
    settings: partialRoomSettingsSchema.optional(),
  }),
);
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const createRoomResponseSchema = z.compile(z.object({ id: z.string() }));
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>;

export const roomUpdateSchema = z.compile(
  z.object({
    name: z.string().optional(),
    mode: z.enum(['server', 'host']).optional(),
    settings: partialRoomSettingsSchema.optional(),
  }),
);
export type RoomUpdate = z.infer<typeof roomUpdateSchema>;

export const publicRoomSchema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    listenerCount: z.int().min(1),
    songCount: z.int().min(0),
  }),
);
export type PublicRoom = z.infer<typeof publicRoomSchema>;

export const publicRoomsSchema = z.compile(z.array(publicRoomSchema));
