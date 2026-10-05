import { z } from 'zod';

export const sourceTypeSchema = z.compile(z.enum(['youtube', 'soundcloud']));
export type SourceType = z.infer<typeof sourceTypeSchema>;

export function isSourceType(value: string): value is SourceType {
  return value === 'youtube' || value === 'soundcloud';
}

export const playbackRestrictionSchema = z.compile(
  z.enum(['age', 'region', 'embedding']).optional(),
);
export type PlaybackRestriction = z.infer<typeof playbackRestrictionSchema>;

export const playlistItemSchema = z.compile(
  z.object({
    id: z.string(),
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.string().optional(),
    title: z.string(),
    publisher: z.string().optional(),
    thumbnailUrl: z.string(),
    duration: z.number(),
    addedBy: z.string().optional(),
    addedAt: z.string(),
    voteCount: z.number().optional(),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type PlaylistItem = z.infer<typeof playlistItemSchema>;

export const addPlaylistItemRequestSchema = z.compile(
  z.object({
    sourceType: sourceTypeSchema,
    sourceId: z.string(),
    providerUrl: z.string().optional(),
    title: z.string(),
    publisher: z.string().optional(),
    thumbnailUrl: z.string(),
    duration: z.number(),
  }),
);
export type AddPlaylistItemRequest = z.infer<
  typeof addPlaylistItemRequestSchema
>;

export const addPlaylistItemOutcomeSchema = z.compile(
  z.enum(['added', 'duplicate_voted', 'duplicate_already_voted']),
);
export type AddPlaylistItemOutcome = z.infer<
  typeof addPlaylistItemOutcomeSchema
>;

export const addPlaylistItemResponseSchema = z.compile(
  z.object({
    playlistItem: playlistItemSchema,
    outcome: addPlaylistItemOutcomeSchema,
  }),
);
export type AddPlaylistItemResponse = z.infer<
  typeof addPlaylistItemResponseSchema
>;

export const addPlaylistRequestV2Schema = z.compile(
  z.object({ playlistItems: z.array(addPlaylistItemRequestSchema).min(1) }),
);
export type AddPlaylistRequestV2 = z.infer<typeof addPlaylistRequestV2Schema>;

export const playlistItemsListSchema = z.compile(z.array(playlistItemSchema));
export type PlaylistItemsList = z.infer<typeof playlistItemsListSchema>;

export const playlistItemIdUpdateSchema = z.compile(
  z.object({ id: z.string() }),
);
export type PlaylistItemIdUpdate = z.infer<typeof playlistItemIdUpdateSchema>;

export const playlistItemPositionUpdateSchema = z.compile(
  z.object({ playlistItem: playlistItemSchema, position: z.int().min(0) }),
);
export type PlaylistItemPositionUpdate = z.infer<
  typeof playlistItemPositionUpdateSchema
>;
