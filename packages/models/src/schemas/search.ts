import { z } from 'zod';
import { playbackRestrictionSchema, sourceTypeSchema } from './songs';

export const searchResultSchema = z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    providerUrl: z.string().optional(),
    title: z.string(),
    channelTitle: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    duration: z.string().optional(),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type SearchResult = z.infer<typeof searchResultSchema>;

export const musicPlaylistSchema = z.compile(
  z.object({
    id: z.string(),
    source: sourceTypeSchema,
    title: z.string().optional(),
    tracks: z.array(searchResultSchema),
    truncated: z.boolean(),
  }),
);
export type MusicPlaylist = z.infer<typeof musicPlaylistSchema>;

export const searchResponseSchema = z.compile(z.array(searchResultSchema));
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const searchQuerySchema = z.compile(
  z.object({ q: z.string().trim().min(3) }),
);
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const providerURLQuerySchema = z.compile(z.object({ url: z.url() }));
export type ProviderURLQuery = z.infer<typeof providerURLQuerySchema>;
