import { z } from 'zod';

export const generatedPlaylistPromptMaxLength = 300;

export const generatedTrackSchema = z.compile(
  z.object({
    artist: z.string().trim(),
    title: z.string().trim(),
    youtubeId: z.string().length(11).optional(),
    thumbnailUrl: z.string().optional(),
    duration: z.int().positive().optional(),
  }),
);
export type GeneratedTrack = z.infer<typeof generatedTrackSchema>;

export const generatedPlaylistRequestSchema = z.compile(
  z.object({
    prompt: z.string().trim().max(generatedPlaylistPromptMaxLength),
  }),
);
export type GeneratedPlaylistRequest = z.infer<
  typeof generatedPlaylistRequestSchema
>;

export const generatedPlaylistSchema = z.compile(
  z.array(generatedTrackSchema).min(1),
);
export type GeneratedPlaylist = z.infer<typeof generatedPlaylistSchema>;

export const roomGenerationStatusSchema = z.compile(
  z.enum(['generating', 'completed', 'failed']),
);
export type RoomGenerationStatus = z.infer<typeof roomGenerationStatusSchema>;

export const roomGenerationUpdateSchema = z.compile(
  z.object({
    status: roomGenerationStatusSchema,
    error: z.string().optional(),
  }),
);
export type RoomGenerationUpdate = z.infer<typeof roomGenerationUpdateSchema>;
