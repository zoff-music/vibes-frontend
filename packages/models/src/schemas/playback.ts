import * as v from 'valibot';
import { playlistItemSchema } from './playlist';

export const roomActionRequestSchema = /* @__PURE__ */ v.object({
  action: v.picklist(['play', 'pause', 'seek', 'skip', 'vote']),
  positionMs: v.optional(v.pipe(v.number(), v.finite())),
});

export type RoomActionRequest = v.InferOutput<typeof roomActionRequestSchema>;

export const playbackStateV2Schema = /* @__PURE__ */ v.object({
  currentPlaylistItem: v.nullable(playlistItemSchema),
  isPlaying: v.boolean(),
  positionMs: v.pipe(v.number(), v.finite()),
  updatedAt: v.string(),
  serverTimeMs: v.pipe(v.number(), v.finite()),
});

export type PlaybackStateV2 = v.InferOutput<typeof playbackStateV2Schema>;

export const playbackFailureRequestV2Schema = /* @__PURE__ */ v.object({
  playlistItemId: v.string(),
});

export type PlaybackFailureRequestV2 = v.InferOutput<
  typeof playbackFailureRequestV2Schema
>;

export const skipPlaylistItemResponseSchema = /* @__PURE__ */ v.object({
  action: v.literal('skip'),
  skipped: v.boolean(),
  voted: v.boolean(),
  alreadyVoted: v.boolean(),
  currentVotes: v.pipe(v.number(), v.finite()),
  requiredVotes: v.pipe(v.number(), v.finite()),
  nextPlaylistItem: v.nullable(playlistItemSchema),
  playback: playbackStateV2Schema,
});

export type SkipPlaylistItemResponse = v.InferOutput<
  typeof skipPlaylistItemResponseSchema
>;

export const skipVoteUpdateV2Schema = /* @__PURE__ */ v.object({
  userId: v.string(),
  playlistItemId: v.string(),
  currentVotes: v.pipe(v.number(), v.finite()),
  requiredVotes: v.pipe(v.number(), v.finite()),
});

export type SkipVoteUpdateV2 = v.InferOutput<typeof skipVoteUpdateV2Schema>;
