import * as yup from 'yup';

export const sourceTypeSchema = yup
  .string()
  .oneOf(['youtube', 'soundcloud'])
  .required();
export type SourceType = yup.InferType<typeof sourceTypeSchema>;

export function isSourceType(value: string): value is SourceType {
  return value === 'youtube' || value === 'soundcloud';
}

export const playbackRestrictionSchema = yup
  .string()
  .oneOf(['age', 'region', 'embedding'])
  .optional();
export type PlaybackRestriction = yup.InferType<
  typeof playbackRestrictionSchema
>;

export const songSchema = yup.object({
  id: yup.string().required(),
  sourceType: sourceTypeSchema,
  sourceId: yup.string().required(),
  providerUrl: yup.string().optional(),
  title: yup.string().required(),
  artist: yup.string().optional(),
  thumbnailUrl: yup.string().defined(),
  duration: yup.number().required(),
  addedBy: yup.string().optional(),
  addedAt: yup.string().required(),
  voteCount: yup.number().optional(),
  playbackRestriction: playbackRestrictionSchema,
});
export type Song = yup.InferType<typeof songSchema>;

export const addSongRequestSchema = yup.object({
  sourceType: sourceTypeSchema,
  sourceId: yup.string().required(),
  providerUrl: yup.string().optional(),
  title: yup.string().required(),
  artist: yup.string().optional(),
  thumbnailUrl: yup.string().defined(),
  duration: yup.number().required(),
});
export type AddSongRequest = yup.InferType<typeof addSongRequestSchema>;

export const addSongOutcomeSchema = yup
  .string()
  .oneOf(['added', 'duplicate_voted', 'duplicate_already_voted'])
  .required();
export type AddSongOutcome = yup.InferType<typeof addSongOutcomeSchema>;

export const addSongResponseSchema = yup.object({
  song: songSchema.required(),
  outcome: addSongOutcomeSchema,
});
export type AddSongResponse = yup.InferType<typeof addSongResponseSchema>;

export const addPlaylistRequestSchema = yup.object({
  songs: yup.array(addSongRequestSchema).min(1).required(),
});
export type AddPlaylistRequest = yup.InferType<typeof addPlaylistRequestSchema>;

export const addPlaylistResponseSchema = yup.object({
  results: yup.array(addSongResponseSchema).required(),
});
export type AddPlaylistResponse = yup.InferType<
  typeof addPlaylistResponseSchema
>;

export const songsListSchema = yup.array(songSchema).required();
export type SongsList = yup.InferType<typeof songsListSchema>;
