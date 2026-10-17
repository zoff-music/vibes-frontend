import * as v from 'valibot';

export const addPlaylistResponseSchema = /* @__PURE__ */ v.object({
  importId: v.string(),
  queuedCount: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
});

export type AddPlaylistResponse = v.InferOutput<
  typeof addPlaylistResponseSchema
>;
