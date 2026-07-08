import * as yup from 'yup';
import { songSchema } from './songs';

export const playbackStateSchema = yup.object({
  currentSong: songSchema.nullable().defined(),
  isPlaying: yup.boolean().required(),
  positionMs: yup.number().required(),
  updatedAt: yup.string().required(),
  serverTimeMs: yup.number().required(),
});
export type PlaybackState = yup.InferType<typeof playbackStateSchema>;

export const roomActionRequestSchema = yup.object({
  action: yup
    .string()
    .oneOf(['play', 'pause', 'seek', 'skip', 'vote'])
    .required(),
  positionMs: yup.number().optional(),
});
export type RoomActionRequest = yup.InferType<typeof roomActionRequestSchema>;

export const skipActionResponseSchema = yup.object({
  action: yup.string().oneOf(['skip']).required(),
  skipped: yup.boolean().required(),
  voted: yup.boolean().required(),
  alreadyVoted: yup.boolean().required(),
  currentVotes: yup.number().required(),
  requiredVotes: yup.number().required(),
  nextSong: songSchema.nullable().defined(),
  playback: playbackStateSchema.required(),
});
export type SkipActionResponse = yup.InferType<typeof skipActionResponseSchema>;

export const skipVoteUpdateSchema = yup.object({
  userId: yup.string().required(),
  songId: yup.string().required(),
  currentVotes: yup.number().required(),
  requiredVotes: yup.number().required(),
});
export type SkipVoteUpdate = yup.InferType<typeof skipVoteUpdateSchema>;
