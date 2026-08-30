import { z } from 'zod';
import { playbackRestrictionSchema } from './songs';

export const youTubeVideoSchema = z.compile(
  z.object({
    id: z.string(),
    providerUrl: z.string().optional(),
    title: z.string(),
    channelTitle: z.string(),
    thumbnailUrl: z.string(),
    duration: z.string().optional(),
    playbackRestriction: playbackRestrictionSchema,
  }),
);
export type YouTubeVideo = z.infer<typeof youTubeVideoSchema>;

export const youTubeSearchResponseSchema = z.compile(
  z.array(youTubeVideoSchema),
);
export type YouTubeSearchResponse = z.infer<typeof youTubeSearchResponseSchema>;

export const youTubeSearchQuerySchema = z.compile(
  z.object({ q: z.string().trim().min(3) }),
);
export type YouTubeSearchQuery = z.infer<typeof youTubeSearchQuerySchema>;
