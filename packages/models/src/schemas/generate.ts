import * as z from 'zod/mini';
import { roomTypeSchema } from './room';

export const generatedPlaylistPromptMaxLength = 300;

export const generatedTrackSchema = /* @__PURE__ */ z.compile(
  z.object({
    artist: z.string().check(z.trim()),
    title: z.string().check(z.trim()),
    youtubeId: z.optional(z.string().check(z.length(11))),
    thumbnailUrl: z.optional(z.string()),
    duration: z.optional(z.int().check(z.positive())),
  }),
);
export type GeneratedTrack = z.infer<typeof generatedTrackSchema>;

export const generatedPlaylistRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    prompt: z
      .string()
      .check(z.trim(), z.maxLength(generatedPlaylistPromptMaxLength)),
  }),
);
export type GeneratedPlaylistRequest = z.infer<
  typeof generatedPlaylistRequestSchema
>;

export const generatedRoomRequestV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    prompt: z
      .string()
      .check(z.trim(), z.maxLength(generatedPlaylistPromptMaxLength)),
    roomType: z.optional(roomTypeSchema),
  }),
);
export type GeneratedRoomRequestV2 = z.infer<
  typeof generatedRoomRequestV2Schema
>;

export const generatedPlaylistSchema = /* @__PURE__ */ z.compile(
  z.array(generatedTrackSchema).check(z.minLength(1)),
);
export type GeneratedPlaylist = z.infer<typeof generatedPlaylistSchema>;

export const roomGenerationStatusSchema = /* @__PURE__ */ z.compile(
  z.enum(['generating', 'completed', 'failed']),
);
export type RoomGenerationStatus = z.infer<typeof roomGenerationStatusSchema>;

export const roomGenerationUpdateSchema = /* @__PURE__ */ z.compile(
  z.object({
    status: roomGenerationStatusSchema,
    error: z.optional(z.string()),
  }),
);
export type RoomGenerationUpdate = z.infer<typeof roomGenerationUpdateSchema>;
