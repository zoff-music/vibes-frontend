import * as v from 'valibot';
import { playbackRestrictionSchema, sourceTypeSchema } from './playlist';

export const providerItemSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  source: sourceTypeSchema,
  providerUrl: v.optional(v.string()),
  title: v.string(),
  publisher: v.optional(v.string()),
  thumbnailUrl: v.string(),
  duration: v.optional(v.string()),
  durationSeconds: v.optional(v.pipe(v.number(), v.finite())),
  viewCount: v.optional(v.pipe(v.number(), v.finite())),
  likeCount: v.optional(v.pipe(v.number(), v.finite())),
  playbackRestriction: playbackRestrictionSchema,
});

export type ProviderItem = v.InferOutput<typeof providerItemSchema>;

export const providerPlaylistSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  source: sourceTypeSchema,
  title: v.optional(v.string()),
  items: v.array(providerItemSchema),
  truncated: v.boolean(),
  skippedEmbeddingCount: v.optional(
    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  ),
  skippedMadeForKidsCount: v.optional(
    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  ),
  skippedRoomTypeCount: v.optional(
    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  ),
});

export type ProviderPlaylist = v.InferOutput<typeof providerPlaylistSchema>;

export const providerSearchResponseSchema = /* @__PURE__ */ v.array(
  providerItemSchema,
);

export type ProviderSearchResponse = v.InferOutput<
  typeof providerSearchResponseSchema
>;

export const searchQuerySchema = /* @__PURE__ */ v.object({
  q: v.pipe(v.string(), v.trim(), v.minLength(3)),
  roomId: v.optional(v.pipe(v.string(), v.maxLength(200))),
});

export type SearchQuery = v.InferOutput<typeof searchQuerySchema>;

export const providerURLQuerySchema = /* @__PURE__ */ v.object({
  url: v.pipe(v.string(), v.url('Invalid URL')),
});

export type ProviderURLQuery = v.InferOutput<typeof providerURLQuerySchema>;
