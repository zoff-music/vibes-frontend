import { z } from 'zod';

export const statsSchema = z.compile(
  z.object({
    totalListeners: z.int().min(0),
    totalSongs: z.int().min(0),
    totalRooms: z.int().min(0),
  }),
);

export type Stats = z.infer<typeof statsSchema>;
