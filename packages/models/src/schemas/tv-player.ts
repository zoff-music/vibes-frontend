import { z } from 'zod';

export const tvPlayerQuerySchema = z.compile(
  z.object({
    video: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
    start: z.coerce.number().int().min(0).max(86_400).default(0),
  }),
);
export type TvPlayerQuery = z.infer<typeof tvPlayerQuerySchema>;
