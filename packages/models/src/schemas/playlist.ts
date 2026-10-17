import * as v from 'valibot';
import { objectInputSchema } from './object-input';

export const sourceTypeSchema = /* @__PURE__ */ v.picklist([
  'youtube',
  'soundcloud',
]);

export type SourceType = v.InferOutput<typeof sourceTypeSchema>;

export function isSourceType(value: string): value is SourceType {
  return value === 'youtube' || value === 'soundcloud';
}

export const playbackRestrictionSchema = /* @__PURE__ */ v.optional(
  v.picklist(['age', 'region', 'embedding']),
);

export type PlaybackRestriction = v.InferOutput<
  typeof playbackRestrictionSchema
>;

export const playlistItemSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  sourceType: sourceTypeSchema,
  sourceId: v.string(),
  providerUrl: v.optional(v.string()),
  title: v.string(),
  publisher: v.optional(v.string()),
  thumbnailUrl: v.string(),
  duration: v.pipe(v.number(), v.finite()),
  addedBy: v.optional(v.string()),
  addedAt: v.string(),
  voteCount: v.optional(v.pipe(v.number(), v.finite())),
  playbackRestriction: playbackRestrictionSchema,
});

export type PlaylistItem = v.InferOutput<typeof playlistItemSchema>;

export const itemsQueryV3Schema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    from: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(1))),
    to: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(1))),
    sourceType: v.optional(sourceTypeSchema),
    excludeCurrent: v.optional(v.boolean()),
  }),
);

export const itemsResultV3Schema = /* @__PURE__ */ v.object({
  data: v.array(playlistItemSchema),
  from: v.pipe(v.number(), v.safeInteger()),
  to: v.pipe(v.number(), v.safeInteger()),
  reqFrom: v.pipe(v.number(), v.safeInteger()),
  reqTo: v.pipe(v.number(), v.safeInteger()),
  count: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  total: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export type ItemsQueryV3 = v.InferOutput<typeof itemsQueryV3Schema>;

export type ItemsResultV3 = v.InferOutput<typeof itemsResultV3Schema>;

export const addPlaylistItemRequestSchema = /* @__PURE__ */ v.object({
  sourceType: sourceTypeSchema,
  sourceId: v.string(),
  providerUrl: v.optional(v.string()),
  title: v.string(),
  publisher: v.optional(v.string()),
  thumbnailUrl: v.string(),
  duration: v.pipe(v.number(), v.finite()),
});

export type AddPlaylistItemRequest = v.InferOutput<
  typeof addPlaylistItemRequestSchema
>;

export const addPlaylistItemOutcomeSchema = /* @__PURE__ */ v.picklist([
  'added',
  'duplicate_voted',
  'duplicate_already_voted',
]);

export type AddPlaylistItemOutcome = v.InferOutput<
  typeof addPlaylistItemOutcomeSchema
>;

export const addPlaylistItemResponseSchema = /* @__PURE__ */ v.object({
  playlistItem: playlistItemSchema,
  outcome: addPlaylistItemOutcomeSchema,
});

export type AddPlaylistItemResponse = v.InferOutput<
  typeof addPlaylistItemResponseSchema
>;

export const addPlaylistRequestV2Schema = /* @__PURE__ */ v.object({
  playlistItems: v.pipe(v.array(addPlaylistItemRequestSchema), v.minLength(1)),
});

export type AddPlaylistRequestV2 = v.InferOutput<
  typeof addPlaylistRequestV2Schema
>;

export const playlistItemsListSchema = /* @__PURE__ */ v.array(
  playlistItemSchema,
);

export type PlaylistItemsList = v.InferOutput<typeof playlistItemsListSchema>;

export const playlistItemIdUpdateSchema = /* @__PURE__ */ v.object({
  id: v.string(),
});

export type PlaylistItemIdUpdate = v.InferOutput<
  typeof playlistItemIdUpdateSchema
>;

export const playlistItemPositionUpdateSchema = /* @__PURE__ */ v.object({
  playlistItem: playlistItemSchema,
  position: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export type PlaylistItemPositionUpdate = v.InferOutput<
  typeof playlistItemPositionUpdateSchema
>;
