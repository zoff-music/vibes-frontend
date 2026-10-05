import { z } from 'zod';
import { sourceTypeSchema } from './playlist';

export const roomNameMaxLength = 100;

const roomNameField = z
  .string()
  .trim()
  .min(1, 'Enter a room name.')
  .max(roomNameMaxLength, 'Room names can be at most 100 characters.');
export const roomNameInputSchema = z.compile(roomNameField);

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

/** @deprecated Legacy settings contract. Use roomSettingsV2Schema for current clients. */
export const roomSettingsSchema = z.compile(z.object(roomSettingsShape));
export type RoomSettings = z.infer<typeof roomSettingsSchema>;

const roomModeSchema = z.preprocess(
  (value) => value || 'server',
  z.enum(['server', 'host']).default('server'),
);

/** @deprecated V1 room and legacy SSE contract. Use roomV2Schema for current clients. */
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
/** @deprecated V1 room and legacy SSE contract. Use RoomV2 for current clients. */
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
  z.object({ name: roomNameField.optional() }),
);
export type RoomNameReservationRequest = z.infer<
  typeof roomNameReservationRequestSchema
>;

export const usersUpdateSchema = z.compile(z.number());

const partialRoomSettingsSchema = z.object(roomSettingsShape).partial();

/** @deprecated V1 room creation contract. Use createRoomRequestV2Schema for v2. */
export const createRoomRequestSchema = z.compile(
  z.object({
    name: roomNameField,
    mode: z.enum(['server', 'host']).optional(),
    password: z.string().optional(),
    reservationToken: z.string().optional(),
    settings: partialRoomSettingsSchema.optional(),
  }),
);
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const createRoomResponseSchema = z.compile(z.object({ id: z.string() }));
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>;

/** @deprecated V1 room update contract. Use roomUpdateV2Schema for v2. */
export const roomUpdateSchema = z.compile(
  z.object({
    name: roomNameField.optional(),
    mode: z.enum(['server', 'host']).optional(),
    settings: partialRoomSettingsSchema.optional(),
  }),
);
export type RoomUpdate = z.infer<typeof roomUpdateSchema>;

/** @deprecated V1/v2 discovery entry. Use publicRoomV3Schema for v3. */
export const publicRoomSchema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    listenerCount: z.int().min(0),
    songCount: z.int().min(0),
  }),
);
export type PublicRoom = z.infer<typeof publicRoomSchema>;

export const publicRoomsSchema = z.compile(z.array(publicRoomSchema));

export const publicRoomSearchSchema = z.compile(
  z.object({
    q: z.string().max(100).optional(),
    live: z.boolean().optional(),
    from: z.int().min(0).max(2_147_483_647).optional(),
    to: z.int().min(0).max(2_147_483_647).optional(),
  }),
);
export type PublicRoomSearch = z.infer<typeof publicRoomSearchSchema>;

/** @deprecated V2 discovery response. Use publicRoomResultV3Schema for v3. */
export const publicRoomResultSchema = z.compile(
  z.object({
    rooms: publicRoomsSchema,
    from: z.int().min(0),
    to: z.int().min(0),
    total: z.int().min(0),
    count: z.int().min(0),
  }),
);
export type PublicRoomResult = z.infer<typeof publicRoomResultSchema>;

const roomSettingsV2Shape = {
  skipAllowed: z.boolean(),
  democraticSkip: z.boolean(),
  skipVoteThreshold: z.number(),
  maxContinuousAdds: z.number(),
  removeOnPlay: z.boolean(),
  allowDuplicates: z.boolean(),
  enabledSources: z.array(sourceTypeSchema),
  onlyAdminAddPlaylistItems: z.boolean().optional(),
  public: z.boolean(),
  playlistImport: z.boolean(),
};

export const roomSettingsV2Schema = z.compile(z.object(roomSettingsV2Shape));
export type RoomSettingsV2 = z.infer<typeof roomSettingsV2Schema>;

export const roomTypeSchema = z.enum(['MUSIC', 'WATCH']);
export type RoomType = z.infer<typeof roomTypeSchema>;

export const roomV2Schema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    mode: roomModeSchema,
    roomType: roomTypeSchema.default('MUSIC'),
    hostId: z.string().nullable().optional(),
    createdAt: z.string(),
    hasPassword: z.boolean(),
    settings: roomSettingsV2Schema,
    userCount: z.number().optional(),
    userId: z.string().optional(),
    isAdmin: z.boolean().optional(),
    activeSources: z.array(sourceTypeSchema).optional(),
    isGenerating: z.boolean().default(false),
    generationCount: z.int().min(0).default(0),
    roomGenerationMaxDailyCount: z.int().min(1),
    roomGenerationMaxExistingPlaylistItems: z.int().min(0),
    generationError: z.string().optional(),
  }),
);
export type RoomV2 = z.infer<typeof roomV2Schema>;

const partialRoomSettingsV2Schema = z.object(roomSettingsV2Shape).partial();

export const createRoomRequestV2Schema = z.compile(
  z.object({
    name: roomNameField,
    mode: z.enum(['server', 'host']).optional(),
    password: z.string().optional(),
    reservationToken: z.string().optional(),
    settings: partialRoomSettingsV2Schema.optional(),
  }),
);
export type CreateRoomRequestV2 = z.infer<typeof createRoomRequestV2Schema>;

export const roomUpdateV2Schema = z.compile(
  z.object({
    name: roomNameField.optional(),
    mode: z.enum(['server', 'host']).optional(),
    settings: partialRoomSettingsV2Schema.optional(),
  }),
);
export type RoomUpdateV2 = z.infer<typeof roomUpdateV2Schema>;

export const publicRoomV3Schema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    roomType: roomTypeSchema.default('MUSIC'),
    listenerCount: z.int().min(0),
    playlistItemCount: z.int().min(0),
  }),
);
export type PublicRoomV3 = z.infer<typeof publicRoomV3Schema>;

export const publicRoomsV3Schema = z.compile(z.array(publicRoomV3Schema));

export const publicRoomResultV3Schema = z.compile(
  z.object({
    rooms: publicRoomsV3Schema,
    from: z.int().min(0),
    to: z.int().min(0),
    total: z.int().min(0),
    count: z.int().min(0),
  }),
);
export type PublicRoomResultV3 = z.infer<typeof publicRoomResultV3Schema>;
