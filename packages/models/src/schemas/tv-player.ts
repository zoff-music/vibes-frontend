import * as v from 'valibot';

export const tvPlayerQuerySchema = /* @__PURE__ */ v.object({
  video: v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_-]{11}$/)),
  start: v.optional(
    v.pipe(
      v.unknown(),
      v.toNumber(),
      v.finite(),
      v.safeInteger(),
      v.minValue(0),
      v.maxValue(86_400),
    ),
    0,
  ),
});

export type TvPlayerQuery = v.InferOutput<typeof tvPlayerQuerySchema>;
