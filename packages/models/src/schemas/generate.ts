import * as yup from 'yup';

export const generatedPlaylistPromptMaxLength = 300;
export const generatedPlaylistTrackCount = 50;
export const roomGenerationMaxExistingSongs = 5;

export const generatedTrackSchema = yup.object({
  artist: yup.string().trim().required(),
  title: yup.string().trim().required(),
  youtubeId: yup.string().length(11).optional(),
  thumbnailUrl: yup.string().optional(),
  duration: yup.number().integer().positive().optional(),
});
export type GeneratedTrack = yup.InferType<typeof generatedTrackSchema>;

export const generatedPlaylistRequestSchema = yup.object({
  prompt: yup.string().trim().max(generatedPlaylistPromptMaxLength).required(),
});
export type GeneratedPlaylistRequest = yup.InferType<
  typeof generatedPlaylistRequestSchema
>;

export const generatedPlaylistSchema = yup
  .array(generatedTrackSchema)
  .min(1)
  .max(generatedPlaylistTrackCount)
  .required();
export type GeneratedPlaylist = yup.InferType<typeof generatedPlaylistSchema>;

export const roomGenerationStatusSchema = yup
  .string()
  .oneOf(['generating', 'completed', 'failed'])
  .required();
export type RoomGenerationStatus = yup.InferType<
  typeof roomGenerationStatusSchema
>;

export const roomGenerationUpdateSchema = yup.object({
  status: roomGenerationStatusSchema,
  error: yup.string().optional(),
});
export type RoomGenerationUpdate = yup.InferType<
  typeof roomGenerationUpdateSchema
>;
