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
export type Song = z.infer<typeof songSchema>;

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
export type AddSongRequest = z.infer<typeof addSongRequestSchema>;

export const addSongOutcomeSchema = z.compile(
  z.enum(['added', 'duplicate_voted', 'duplicate_already_voted']),
);
export type AddSongOutcome = z.infer<typeof addSongOutcomeSchema>;

export const addSongResponseSchema = z.compile(
  z.object({ song: songSchema, outcome: addSongOutcomeSchema }),
);
export type AddSongResponse = z.infer<typeof addSongResponseSchema>;

export const addPlaylistRequestSchema = z.compile(
  z.object({ songs: z.array(addSongRequestSchema).min(1) }),
);
export type AddPlaylistRequest = z.infer<typeof addPlaylistRequestSchema>;

export const addPlaylistResponseSchema = z.compile(
  z.object({
    importId: z.string(),
    queuedCount: z.int().min(1),
  }),
);
export type AddPlaylistResponse = z.infer<typeof addPlaylistResponseSchema>;

export const songsListSchema = z.compile(z.array(songSchema));
export type SongsList = z.infer<typeof songsListSchema>;
