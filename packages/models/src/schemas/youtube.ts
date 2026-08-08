import * as yup from 'yup';
import { playbackRestrictionSchema } from './songs';

export const youTubeVideoSchema = yup.object({
  id: yup.string().required(),
  providerUrl: yup.string().optional(),
  title: yup.string().required(),
  channelTitle: yup.string().required(),
  thumbnailUrl: yup.string().required(),
  duration: yup.string().optional(), // ISO 8601 duration
  playbackRestriction: playbackRestrictionSchema,
});
export type YouTubeVideo = yup.InferType<typeof youTubeVideoSchema>;

export const youTubeSearchResponseSchema = yup.array(youTubeVideoSchema);
export type YouTubeSearchResponse = yup.InferType<
  typeof youTubeSearchResponseSchema
>;

export const youTubeSearchQuerySchema = yup.object({
  q: yup.string().trim().min(3).required(),
});
export type YouTubeSearchQuery = yup.InferType<typeof youTubeSearchQuerySchema>;
