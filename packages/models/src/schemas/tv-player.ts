import * as z from 'zod/mini';

export const tvPlayerQuerySchema = /* @__PURE__ */ z.compile(
  z.object({
    video: z.string().check(z.regex(/^[a-zA-Z0-9_-]{11}$/)),
    start: z._default(
      z.coerce.number().check(z.int(), z.minimum(0), z.maximum(86_400)),
      0,
    ),
  }),
);

export type TvPlayerQuery = z.infer<typeof tvPlayerQuerySchema>;
