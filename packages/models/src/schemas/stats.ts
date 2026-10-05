import { z } from 'zod';

/** @deprecated V1 statistics response. Use statsV2Schema for current clients. */
export const statsSchema = z.compile(
  z.object({
    totalListeners: z.int().min(0),
    totalSongs: z.int().min(0),
    totalRooms: z.int().min(0),
  }),
);

export type Stats = z.infer<typeof statsSchema>;

export const statsV2Schema = z.compile(
  z.object({
    totalListeners: z.int().min(0),
    totalPlaylistItems: z.int().min(0),
    totalRooms: z.int().min(0),
  }),
);
export type StatsV2 = z.infer<typeof statsV2Schema>;
