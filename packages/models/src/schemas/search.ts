import { z } from 'zod';
import { playbackRestrictionSchema, sourceTypeSchema } from './playlist';

export const providerItemSchema = z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    providerUrl: z.string().optional(),
    title: z.string(),
    publisher: z.string().optional(),
    thumbnailUrl: z.string(),
    duration: z.string().optional(),
    durationSeconds: z.number().optional(),
    viewCount: z.number().optional(),
    likeCount: z.number().optional(),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type ProviderItem = z.infer<typeof providerItemSchema>;

export const providerPlaylistSchema = z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    title: z.string().optional(),
    items: z.array(providerItemSchema),
    truncated: z.boolean(),
    skippedEmbeddingCount: z.int().min(0).optional(),
    skippedMadeForKidsCount: z.int().min(0).optional(),
    skippedRoomTypeCount: z.int().min(0).optional(),
  }),
);
export type ProviderPlaylist = z.infer<typeof providerPlaylistSchema>;

export const providerSearchResponseSchema = z.compile(
  z.array(providerItemSchema),
);
export type ProviderSearchResponse = z.infer<
  typeof providerSearchResponseSchema
>;

export const searchQuerySchema = z.compile(
  z.object({
    q: z.string().trim().min(3),
    roomId: z.string().max(200).optional(),
  }),
);
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const providerURLQuerySchema = z.compile(z.object({ url: z.url() }));
export type ProviderURLQuery = z.infer<typeof providerURLQuerySchema>;
