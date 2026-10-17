import * as z from 'zod/mini';

export const addPlaylistResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    importId: z.string(),
    queuedCount: z.int().check(z.minimum(1)),
  }),
);

export type AddPlaylistResponse = z.infer<typeof addPlaylistResponseSchema>;
