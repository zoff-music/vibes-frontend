import * as yup from 'yup';

export const sourceTypeSchema = yup
  .string()
  .oneOf(['youtube', 'spotify', 'soundcloud'])
  .required();
export type SourceType = yup.InferType<typeof sourceTypeSchema>;

export const songSchema = yup.object({
  id: yup.string().required(),
  sourceType: sourceTypeSchema,
  sourceId: yup.string().required(),
  title: yup.string().required(),
  artist: yup.string().optional(),
  thumbnailUrl: yup.string().required(),
  duration: yup.number().required(),
  addedBy: yup.string().required(),
  addedByNickname: yup.string().optional(),
  addedAt: yup.string().required(),
  voteCount: yup.number().optional(),
});
export type Song = yup.InferType<typeof songSchema>;

export const addSongRequestSchema = yup.object({
  sourceType: sourceTypeSchema,
  sourceId: yup.string().required(),
  title: yup.string().required(),
  artist: yup.string().optional(),
  thumbnailUrl: yup.string().required(),
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

export const songsListSchema = yup.array(songSchema).required();
export type SongsList = yup.InferType<typeof songsListSchema>;
