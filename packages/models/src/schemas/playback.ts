import * as z from 'zod/mini';
import { playlistItemSchema } from './playlist';

export const roomActionRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    action: z.enum(['play', 'pause', 'seek', 'skip', 'vote']),
    positionMs: z.optional(z.number()),
  }),
);

export type RoomActionRequest = z.infer<typeof roomActionRequestSchema>;

export const playbackStateV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    currentPlaylistItem: z.nullable(playlistItemSchema),
    isPlaying: z.boolean(),
    positionMs: z.number(),
    updatedAt: z.string(),
    serverTimeMs: z.number(),
  }),
);

export type PlaybackStateV2 = z.infer<typeof playbackStateV2Schema>;

export const playbackFailureRequestV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    playlistItemId: z.string(),
  }),
);

export type PlaybackFailureRequestV2 = z.infer<
  typeof playbackFailureRequestV2Schema
>;

export const skipPlaylistItemResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    action: z.literal('skip'),
    skipped: z.boolean(),
    voted: z.boolean(),
    alreadyVoted: z.boolean(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
    nextPlaylistItem: z.nullable(playlistItemSchema),
    playback: playbackStateV2Schema,
  }),
);

export type SkipPlaylistItemResponse = z.infer<
  typeof skipPlaylistItemResponseSchema
>;

export const skipVoteUpdateV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    userId: z.string(),
    playlistItemId: z.string(),
    currentVotes: z.number(),
    requiredVotes: z.number(),
  }),
);

export type SkipVoteUpdateV2 = z.infer<typeof skipVoteUpdateV2Schema>;
