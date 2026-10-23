import * as v from 'valibot';
import { generatedPlaylistPromptMaxLength } from '../limits';
import { roomTypeSchema } from './room';

export const generatedTrackSchema = /* @__PURE__ */ v.object({
  artist: v.pipe(v.string(), v.trim()),
  title: v.pipe(v.string(), v.trim()),
  youtubeId: v.optional(v.pipe(v.string(), v.length(11))),
  thumbnailUrl: v.optional(v.string()),
  duration: v.optional(v.pipe(v.number(), v.safeInteger(), v.gtValue(0))),
});

export type GeneratedTrack = v.InferOutput<typeof generatedTrackSchema>;

export const generatedPlaylistRequestSchema = /* @__PURE__ */ v.object({
  prompt: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(generatedPlaylistPromptMaxLength),
  ),
});

export type GeneratedPlaylistRequest = v.InferOutput<
  typeof generatedPlaylistRequestSchema
>;

export const generatedRoomRequestV2Schema = /* @__PURE__ */ v.object({
  prompt: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(generatedPlaylistPromptMaxLength),
  ),
  roomType: v.optional(roomTypeSchema),
});

export type GeneratedRoomRequestV2 = v.InferOutput<
  typeof generatedRoomRequestV2Schema
>;

export const generatedPlaylistSchema = /* @__PURE__ */ v.pipe(
  v.array(generatedTrackSchema),
  v.minLength(1),
);

export type GeneratedPlaylist = v.InferOutput<typeof generatedPlaylistSchema>;

export const roomGenerationStatusSchema = /* @__PURE__ */ v.picklist([
  'generating',
  'completed',
  'failed',
]);

export type RoomGenerationStatus = v.InferOutput<
  typeof roomGenerationStatusSchema
>;

export const roomGenerationUpdateSchema = /* @__PURE__ */ v.object({
  status: roomGenerationStatusSchema,
  error: v.optional(v.string()),
});

export type RoomGenerationUpdate = v.InferOutput<
  typeof roomGenerationUpdateSchema
>;

export const generationStatusSchema = /* @__PURE__ */ v.object({
  id: v.pipe(v.string(), v.regex(/^[1-9]\d*$/)),
  roomId: v.optional(v.string()),
  status: roomGenerationStatusSchema,
  error: v.optional(v.string()),
});

export type GenerationStatus = v.InferOutput<typeof generationStatusSchema>;
