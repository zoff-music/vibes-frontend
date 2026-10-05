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

/** @deprecated V1 request contract. Use addPlaylistItemRequestSchema for v2. */
export const addSongRequestSchema = z.compile(
  z.object({
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.string().optional(),
    title: z.string(),
    artist: z.string().optional(),
    thumbnailUrl: z.string(),
    duration: z.number(),
  }),
);
/** @deprecated V1 request contract. Use AddPlaylistItemRequest for v2. */
export type AddSongRequest = z.infer<typeof addSongRequestSchema>;

export const addSongOutcomeSchema = z.compile(
  z.enum(['added', 'duplicate_voted', 'duplicate_already_voted']),
);
export type AddSongOutcome = z.infer<typeof addSongOutcomeSchema>;

/** @deprecated V1 response contract. Use addPlaylistItemResponseSchema for v2. */
export const addSongResponseSchema = z.compile(
  z.object({ song: songSchema, outcome: addSongOutcomeSchema }),
);
/** @deprecated V1 response contract. Use AddPlaylistItemResponse for v2. */
export type AddSongResponse = z.infer<typeof addSongResponseSchema>;

/** @deprecated V1 import contract. Use addPlaylistRequestV2Schema for v2. */
export const addPlaylistRequestSchema = z.compile(
  z.object({ songs: z.array(addSongRequestSchema).min(1) }),
);
/** @deprecated V1 import contract. Use AddPlaylistRequestV2 for v2. */
export type AddPlaylistRequest = z.infer<typeof addPlaylistRequestSchema>;

export const addPlaylistResponseSchema = z.compile(
  z.object({
    importId: z.string(),
    queuedCount: z.int().min(1),
  }),
);
export type AddPlaylistResponse = z.infer<typeof addPlaylistResponseSchema>;

/** @deprecated Legacy queue contract. Use playlistItemsListSchema for v2. */
export const songsListSchema = z.compile(z.array(songSchema));
export type SongsList = z.infer<typeof songsListSchema>;

export const songIdUpdateSchema = z.compile(z.object({ id: z.string() }));
export type SongIdUpdate = z.infer<typeof songIdUpdateSchema>;

/** @deprecated V2 SSE contract. Use playlistItemPositionUpdateSchema for v3 SSE. */
export const songPositionUpdateSchema = z.compile(
  z.object({
    song: songSchema,
    position: z.int().min(0),
  }),
);
export type SongPositionUpdate = z.infer<typeof songPositionUpdateSchema>;
