import { z } from 'zod';
import { playlistItemSchema } from './playlist';
import { songSchema } from './songs';

/** @deprecated Legacy API/SSE contract. Use playbackStateV2Schema for current clients. */
export const playbackStateSchema = z.compile(
  z.object({
    currentSong: songSchema.nullable(),
    isPlaying: z.boolean(),
    positionMs: z.number(),
    updatedAt: z.string(),
    serverTimeMs: z.number(),
  }),
);
/** @deprecated Legacy API/SSE contract. Use PlaybackStateV2 for current clients. */
export type PlaybackState = z.infer<typeof playbackStateSchema>;

export const roomActionRequestSchema = z.compile(
  z.object({
    action: z.enum(['play', 'pause', 'seek', 'skip', 'vote']),
    positionMs: z.number().optional(),
  }),
);
export type RoomActionRequest = z.infer<typeof roomActionRequestSchema>;

/** @deprecated V1 failure request. Use playbackFailureRequestV2Schema for v2. */
export const playbackFailureRequestSchema = z.compile(
  z.object({ songId: z.string() }),
);
export type PlaybackFailureRequest = z.infer<
  typeof playbackFailureRequestSchema
>;

/** @deprecated V1 skip response. Use skipPlaylistItemResponseSchema for v2. */
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

/** @deprecated Legacy room SSE payload. Use skipVoteUpdateV2Schema for v3 SSE. */
export const skipVoteUpdateSchema = z.compile(
  z.object({
    userId: z.string(),
    songId: z.string(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
  }),
);
export type SkipVoteUpdate = z.infer<typeof skipVoteUpdateSchema>;

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
