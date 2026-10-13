import * as z from 'zod/mini';
import { playbackRestrictionSchema, sourceTypeSchema } from './playlist';

export const providerItemSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    providerUrl: z.optional(z.string()),
    title: z.string(),
    publisher: z.optional(z.string()),
    thumbnailUrl: z.string(),
    duration: z.optional(z.string()),
    durationSeconds: z.optional(z.number()),
    viewCount: z.optional(z.number()),
    likeCount: z.optional(z.number()),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type ProviderItem = z.infer<typeof providerItemSchema>;

export const providerPlaylistSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    title: z.optional(z.string()),
    items: z.array(providerItemSchema),
    truncated: z.boolean(),
    skippedEmbeddingCount: z.optional(z.int().check(z.minimum(0))),
    skippedMadeForKidsCount: z.optional(z.int().check(z.minimum(0))),
    skippedRoomTypeCount: z.optional(z.int().check(z.minimum(0))),
  }),
);
export type ProviderPlaylist = z.infer<typeof providerPlaylistSchema>;

export const providerSearchResponseSchema = /* @__PURE__ */ z.compile(
  z.array(providerItemSchema),
);
export type ProviderSearchResponse = z.infer<
  typeof providerSearchResponseSchema
>;

export const searchQuerySchema = /* @__PURE__ */ z.compile(
  z.object({
    q: z.string().check(z.trim(), z.minLength(3)),
    roomId: z.optional(z.string().check(z.maxLength(200))),
  }),
);
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const providerURLQuerySchema = /* @__PURE__ */ z.compile(
  z.object({
    url: z.url(),
  }),
);
export type ProviderURLQuery = z.infer<typeof providerURLQuerySchema>;
