import * as z from 'zod/mini';

export const statsV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    totalListeners: z.int().check(z.minimum(0)),
    totalPlaylistItems: z.int().check(z.minimum(0)),
    totalRooms: z.int().check(z.minimum(0)),
  }),
);

export type StatsV2 = z.infer<typeof statsV2Schema>;
