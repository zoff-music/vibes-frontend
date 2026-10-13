import { z } from 'zod';

import { playbackRestrictionSchema, sourceTypeSchema } from './playlist';

/** @deprecated Legacy v1 and Cast wire contract. Use playlistItemSchema internally. */
export const songSchema = z.compile(
  z.object({
    id: z.string(),
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.string().optional(),
    title: z.string(),
    artist: z.string().optional(),
    thumbnailUrl: z.string(),
    duration: z.number(),
    addedBy: z.string().optional(),
    addedAt: z.string(),
    voteCount: z.number().optional(),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
/** @deprecated Retained for legacy API and Cast messages. Use PlaylistItem internally. */
export type Song = z.infer<typeof songSchema>;

export const addPlaylistResponseSchema = z.compile(
  z.object({
    importId: z.string(),
    queuedCount: z.int().min(1),
  }),
);
export type AddPlaylistResponse = z.infer<typeof addPlaylistResponseSchema>;
