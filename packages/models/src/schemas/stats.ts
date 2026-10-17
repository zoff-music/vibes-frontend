import * as v from 'valibot';

export const statsV2Schema = /* @__PURE__ */ v.object({
  totalListeners: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  totalPlaylistItems: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  totalRooms: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export type StatsV2 = v.InferOutput<typeof statsV2Schema>;
