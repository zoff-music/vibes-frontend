import * as z from 'zod/mini';

export const sourceTypeSchema = /* @__PURE__ */ z.compile(
  z.enum(['youtube', 'soundcloud']),
);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export function isSourceType(value: string): value is SourceType {
  return value === 'youtube' || value === 'soundcloud';
}

export const playbackRestrictionSchema = /* @__PURE__ */ z.compile(
  z.optional(z.enum(['age', 'region', 'embedding'])),
);
export type PlaybackRestriction = z.infer<typeof playbackRestrictionSchema>;

export const playlistItemSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.optional(z.string()),
    title: z.string(),
    publisher: z.optional(z.string()),
    thumbnailUrl: z.string(),
    duration: z.number(),
    addedBy: z.optional(z.string()),
    addedAt: z.string(),
    voteCount: z.optional(z.number()),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type PlaylistItem = z.infer<typeof playlistItemSchema>;

export const addPlaylistItemRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.optional(z.string()),
    title: z.string(),
    publisher: z.optional(z.string()),
    thumbnailUrl: z.string(),
    duration: z.number(),
  }),
);
export type AddPlaylistItemRequest = z.infer<
  typeof addPlaylistItemRequestSchema
>;

export const addPlaylistItemOutcomeSchema = /* @__PURE__ */ z.compile(
  z.enum(['added', 'duplicate_voted', 'duplicate_already_voted']),
);
export type AddPlaylistItemOutcome = z.infer<
  typeof addPlaylistItemOutcomeSchema
>;

export const addPlaylistItemResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    playlistItem: playlistItemSchema,
    outcome: addPlaylistItemOutcomeSchema,
  }),
);
export type AddPlaylistItemResponse = z.infer<
  typeof addPlaylistItemResponseSchema
>;

export const addPlaylistRequestV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    playlistItems: z.array(addPlaylistItemRequestSchema).check(z.minLength(1)),
  }),
);
export type AddPlaylistRequestV2 = z.infer<typeof addPlaylistRequestV2Schema>;

export const playlistItemsListSchema = /* @__PURE__ */ z.compile(
  z.array(playlistItemSchema),
);
export type PlaylistItemsList = z.infer<typeof playlistItemsListSchema>;

export const playlistItemIdUpdateSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
  }),
);
export type PlaylistItemIdUpdate = z.infer<typeof playlistItemIdUpdateSchema>;

export const playlistItemPositionUpdateSchema = /* @__PURE__ */ z.compile(
  z.object({
    playlistItem: playlistItemSchema,
    position: z.int().check(z.minimum(0)),
  }),
);
export type PlaylistItemPositionUpdate = z.infer<
  typeof playlistItemPositionUpdateSchema
>;
