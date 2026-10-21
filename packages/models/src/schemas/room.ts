import * as v from 'valibot';
import { roomNameMaxLength } from '../limits';
import { objectInputSchema } from './object-input';
import { sourceTypeSchema } from './playlist';

const roomNameField = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, 'Enter a room name.'),
  v.maxLength(roomNameMaxLength, 'Room names can be at most 100 characters.'),
);
export const roomNameInputSchema = roomNameField;

const roomModeSchema = v.pipe(
  v.unknown(),
  v.transform((value) => value || 'server'),
  v.picklist(['server', 'host']),
);

export const roomHostUpdateSchema = /* @__PURE__ */ v.object({
  userId: v.string(),
  message: v.string(),
});

export type RoomHostUpdate = v.InferOutput<typeof roomHostUpdateSchema>;

export const roomNameReservationSchema = /* @__PURE__ */ v.object({
  name: v.string(),
  token: v.string(),
  expiresAt: v.string(),
});

export type RoomNameReservation = v.InferOutput<
  typeof roomNameReservationSchema
>;

export const roomNameReservationRequestSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    name: v.optional(roomNameField),
  }),
);

export type RoomNameReservationRequest = v.InferOutput<
  typeof roomNameReservationRequestSchema
>;

export const usersUpdateSchema = /* @__PURE__ */ v.pipe(v.number(), v.finite());

export const roomTypeSchema = v.picklist(['MUSIC', 'WATCH']);

export type RoomType = v.InferOutput<typeof roomTypeSchema>;

export const roomTypeQuerySchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    roomType: v.optional(roomTypeSchema),
  }),
);

export const publicRoomSearchSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    q: v.optional(v.pipe(v.string(), v.maxLength(100))),
    roomType: v.optional(roomTypeSchema),
    live: v.optional(v.boolean()),
    from: v.optional(
      v.pipe(
        v.number(),
        v.safeInteger(),
        v.minValue(0),
        v.maxValue(2_147_483_647),
      ),
    ),
    to: v.optional(
      v.pipe(
        v.number(),
        v.safeInteger(),
        v.minValue(0),
        v.maxValue(2_147_483_647),
      ),
    ),
  }),
);

export type PublicRoomSearch = v.InferOutput<typeof publicRoomSearchSchema>;

const roomSettingsV2Shape = {
  skipAllowed: v.boolean(),
  democraticSkip: v.boolean(),
  skipVoteThreshold: v.pipe(v.number(), v.finite()),
  maxContinuousAdds: v.pipe(v.number(), v.finite()),
  removeOnPlay: v.boolean(),
  allowDuplicates: v.boolean(),
  enabledSources: v.array(sourceTypeSchema),
  onlyAdminAddPlaylistItems: v.optional(v.boolean()),
  public: v.boolean(),
  playlistImport: v.boolean(),
};

export const roomSettingsV2Schema = /* @__PURE__ */ v.object(
  roomSettingsV2Shape,
);

export type RoomSettingsV2 = v.InferOutput<typeof roomSettingsV2Schema>;

export const roomV2Schema = /* @__PURE__ */ v.object({
  flagged: v.optional(v.boolean()),
  id: v.string(),
  name: v.string(),
  mode: v.optional(roomModeSchema, 'server'),
  roomType: v.optional(roomTypeSchema, 'MUSIC'),
  hostId: v.optional(v.nullable(v.string())),
  createdAt: v.string(),
  hasPassword: v.boolean(),
  settings: roomSettingsV2Schema,
  userCount: v.optional(v.pipe(v.number(), v.finite())),
  userId: v.optional(v.string()),
  isAdmin: v.optional(v.boolean()),
  activeSources: v.optional(v.array(sourceTypeSchema)),
  isGenerating: v.optional(v.boolean(), false),
  generationCount: v.optional(
    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
    0,
  ),
  roomGenerationMaxDailyCount: v.pipe(
    v.number(),
    v.safeInteger(),
    v.minValue(1),
  ),
  roomGenerationMaxExistingPlaylistItems: v.pipe(
    v.number(),
    v.safeInteger(),
    v.minValue(0),
  ),
  generationError: v.optional(v.string()),
});

export type RoomV2 = v.InferOutput<typeof roomV2Schema>;

const partialRoomSettingsV2Schema = v.pipe(
  objectInputSchema,
  v.partial(v.object(roomSettingsV2Shape)),
);

export const createRoomRequestV2Schema = /* @__PURE__ */ v.object({
  name: roomNameField,
  roomType: v.optional(roomTypeSchema),
  mode: v.optional(v.picklist(['server', 'host'])),
  password: v.optional(v.string()),
  reservationToken: v.optional(v.string()),
  settings: v.optional(partialRoomSettingsV2Schema),
});

export type CreateRoomRequestV2 = v.InferOutput<
  typeof createRoomRequestV2Schema
>;

export const roomUpdateV2Schema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    name: v.optional(roomNameField),
    mode: v.optional(v.picklist(['server', 'host'])),
    settings: v.optional(partialRoomSettingsV2Schema),
  }),
);

export type RoomUpdateV2 = v.InferOutput<typeof roomUpdateV2Schema>;

export const publicRoomV3Schema = /* @__PURE__ */ v.object({
  id: v.string(),
  name: v.string(),
  roomType: v.optional(roomTypeSchema, 'MUSIC'),
  listenerCount: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  playlistItemCount: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export type PublicRoomV3 = v.InferOutput<typeof publicRoomV3Schema>;

export const publicRoomsV3Schema = /* @__PURE__ */ v.array(publicRoomV3Schema);

export const publicRoomResultV3Schema = /* @__PURE__ */ v.object({
  rooms: publicRoomsV3Schema,
  from: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  to: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  total: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  count: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export type PublicRoomResultV3 = v.InferOutput<typeof publicRoomResultV3Schema>;
