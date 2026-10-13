import * as z from 'zod/mini';

import { playbackRestrictionSchema, sourceTypeSchema } from './playlist';

/** @deprecated Legacy v1 and Cast wire contract. Use playlistItemSchema internally. */

/** @deprecated Legacy v1 and Cast wire contract. Use playlistItemSchema internally. */
export const songSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.optional(z.string()),
    title: z.string(),
    artist: z.optional(z.string()),
    thumbnailUrl: z.string(),
    duration: z.number(),
    addedBy: z.optional(z.string()),
    addedAt: z.string(),
    voteCount: z.optional(z.number()),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
/** @deprecated Retained for legacy API and Cast messages. Use PlaylistItem internally. */

/** @deprecated Retained for legacy API and Cast messages. Use PlaylistItem internally. */
export type Song = z.infer<typeof songSchema>;

export const addPlaylistResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    importId: z.string(),
    queuedCount: z.int().check(z.minimum(1)),
  }),
);
export type AddPlaylistResponse = z.infer<typeof addPlaylistResponseSchema>;
