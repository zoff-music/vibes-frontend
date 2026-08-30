import { z } from 'zod';
import { songSchema } from './songs';

export const playbackStateSchema = z.compile(
  z.object({
    currentSong: songSchema.nullable(),
    isPlaying: z.boolean(),
    positionMs: z.number(),
    updatedAt: z.string(),
    serverTimeMs: z.number(),
  }),
);
export type PlaybackState = z.infer<typeof playbackStateSchema>;

export const roomActionRequestSchema = z.compile(
  z.object({
    action: z.enum(['play', 'pause', 'seek', 'skip', 'vote']),
    positionMs: z.number().optional(),
  }),
);
export type RoomActionRequest = z.infer<typeof roomActionRequestSchema>;

export const playbackFailureRequestSchema = z.compile(
  z.object({ songId: z.string() }),
);
export type PlaybackFailureRequest = z.infer<
  typeof playbackFailureRequestSchema
>;

export const skipActionResponseSchema = z.compile(
  z.object({
    action: z.literal('skip'),
    skipped: z.boolean(),
    voted: z.boolean(),
    alreadyVoted: z.boolean(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
    nextSong: songSchema.nullable(),
    playback: playbackStateSchema,
  }),
);
export type SkipActionResponse = z.infer<typeof skipActionResponseSchema>;

export const skipVoteUpdateSchema = z.compile(
  z.object({
    userId: z.string(),
    songId: z.string(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
  }),
);
export type SkipVoteUpdate = z.infer<typeof skipVoteUpdateSchema>;
