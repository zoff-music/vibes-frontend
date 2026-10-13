import { z } from 'zod';
import { playlistItemSchema } from './playlist';

export const roomActionRequestSchema = z.compile(
  z.object({
    action: z.enum(['play', 'pause', 'seek', 'skip', 'vote']),
    positionMs: z.number().optional(),
  }),
);
export type RoomActionRequest = z.infer<typeof roomActionRequestSchema>;

export const playbackStateV2Schema = z.compile(
  z.object({
    currentPlaylistItem: playlistItemSchema.nullable(),
    isPlaying: z.boolean(),
    positionMs: z.number(),
    updatedAt: z.string(),
    serverTimeMs: z.number(),
  }),
);
export type PlaybackStateV2 = z.infer<typeof playbackStateV2Schema>;

export const playbackFailureRequestV2Schema = z.compile(
  z.object({ playlistItemId: z.string() }),
);
export type PlaybackFailureRequestV2 = z.infer<
  typeof playbackFailureRequestV2Schema
>;

export const skipPlaylistItemResponseSchema = z.compile(
  z.object({
    action: z.literal('skip'),
    skipped: z.boolean(),
    voted: z.boolean(),
    alreadyVoted: z.boolean(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
    nextPlaylistItem: playlistItemSchema.nullable(),
    playback: playbackStateV2Schema,
  }),
);
export type SkipPlaylistItemResponse = z.infer<
  typeof skipPlaylistItemResponseSchema
>;

export const skipVoteUpdateV2Schema = z.compile(
  z.object({
    userId: z.string(),
    playlistItemId: z.string(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
  }),
);
export type SkipVoteUpdateV2 = z.infer<typeof skipVoteUpdateV2Schema>;
