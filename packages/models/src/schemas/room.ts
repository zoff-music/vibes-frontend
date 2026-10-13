import * as z from 'zod/mini';
import { sourceTypeSchema } from './playlist';

export const roomNameMaxLength = 100;

const roomNameField = z
  .string()
  .check(
    z.trim(),
    z.minLength(1, 'Enter a room name.'),
    z.maxLength(roomNameMaxLength, 'Room names can be at most 100 characters.'),
  );
export const roomNameInputSchema = /* @__PURE__ */ z.compile(roomNameField);

const roomModeSchema = z.pipe(
  z.transform((value: string | null | undefined) => value || 'server'),
  z.enum(['server', 'host']),
);

export const roomHostUpdateSchema = /* @__PURE__ */ z.compile(
  z.object({
    userId: z.string(),
    message: z.string(),
  }),
);
export type RoomHostUpdate = z.infer<typeof roomHostUpdateSchema>;

export const roomNameReservationSchema = /* @__PURE__ */ z.compile(
  z.object({
    name: z.string(),
    token: z.string(),
    expiresAt: z.string(),
  }),
);
export type RoomNameReservation = z.infer<typeof roomNameReservationSchema>;

export const roomNameReservationRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    name: z.optional(roomNameField),
  }),
);
export type RoomNameReservationRequest = z.infer<
  typeof roomNameReservationRequestSchema
>;

export const usersUpdateSchema = /* @__PURE__ */ z.compile(z.number());

export const roomTypeSchema = z.enum(['MUSIC', 'WATCH']);
export type RoomType = z.infer<typeof roomTypeSchema>;

export const roomTypeQuerySchema = /* @__PURE__ */ z.compile(
  z.object({
    roomType: z.optional(roomTypeSchema),
  }),
);

export const publicRoomSearchSchema = /* @__PURE__ */ z.compile(
  z.object({
    q: z.optional(z.string().check(z.maxLength(100))),
    roomType: z.optional(roomTypeSchema),
    live: z.optional(z.boolean()),
    from: z.optional(z.int().check(z.minimum(0), z.maximum(2_147_483_647))),
    to: z.optional(z.int().check(z.minimum(0), z.maximum(2_147_483_647))),
  }),
);
export type PublicRoomSearch = z.infer<typeof publicRoomSearchSchema>;

const roomSettingsV2Shape = {
  skipAllowed: z.boolean(),
  democraticSkip: z.boolean(),
  skipVoteThreshold: z.number(),
  maxContinuousAdds: z.number(),
  removeOnPlay: z.boolean(),
  allowDuplicates: z.boolean(),
  enabledSources: z.array(sourceTypeSchema),
  onlyAdminAddPlaylistItems: z.optional(z.boolean()),
  public: z.boolean(),
  playlistImport: z.boolean(),
};

export const roomSettingsV2Schema = /* @__PURE__ */ z.compile(
  z.object(roomSettingsV2Shape),
);
export type RoomSettingsV2 = z.infer<typeof roomSettingsV2Schema>;

export const roomV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    mode: roomModeSchema,
    roomType: z._default(roomTypeSchema, 'MUSIC'),
    hostId: z.optional(z.nullable(z.string())),
    createdAt: z.string(),
    hasPassword: z.boolean(),
    settings: roomSettingsV2Schema,
    userCount: z.optional(z.number()),
    userId: z.optional(z.string()),
    isAdmin: z.optional(z.boolean()),
    activeSources: z.optional(z.array(sourceTypeSchema)),
    isGenerating: z._default(z.boolean(), false),
    generationCount: z._default(z.int().check(z.minimum(0)), 0),
    roomGenerationMaxDailyCount: z.int().check(z.minimum(1)),
    roomGenerationMaxExistingPlaylistItems: z.int().check(z.minimum(0)),
    generationError: z.optional(z.string()),
  }),
);
export type RoomV2 = z.infer<typeof roomV2Schema>;

const partialRoomSettingsV2Schema = z.partial(z.object(roomSettingsV2Shape));

export const createRoomRequestV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    name: roomNameField,
    roomType: z.optional(roomTypeSchema),
    mode: z.optional(z.enum(['server', 'host'])),
    password: z.optional(z.string()),
    reservationToken: z.optional(z.string()),
    settings: z.optional(partialRoomSettingsV2Schema),
  }),
);
export type CreateRoomRequestV2 = z.infer<typeof createRoomRequestV2Schema>;

export const roomUpdateV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    name: z.optional(roomNameField),
    mode: z.optional(z.enum(['server', 'host'])),
    settings: z.optional(partialRoomSettingsV2Schema),
  }),
);
export type RoomUpdateV2 = z.infer<typeof roomUpdateV2Schema>;

export const publicRoomV3Schema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    roomType: z._default(roomTypeSchema, 'MUSIC'),
    listenerCount: z.int().check(z.minimum(0)),
    playlistItemCount: z.int().check(z.minimum(0)),
  }),
);
export type PublicRoomV3 = z.infer<typeof publicRoomV3Schema>;

export const publicRoomsV3Schema = /* @__PURE__ */ z.compile(
  z.array(publicRoomV3Schema),
);

export const publicRoomResultV3Schema = /* @__PURE__ */ z.compile(
  z.object({
    rooms: publicRoomsV3Schema,
    from: z.int().check(z.minimum(0)),
    to: z.int().check(z.minimum(0)),
    total: z.int().check(z.minimum(0)),
    count: z.int().check(z.minimum(0)),
  }),
);
export type PublicRoomResultV3 = z.infer<typeof publicRoomResultV3Schema>;
