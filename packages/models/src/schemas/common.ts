import * as z from 'zod/mini';

export const emptyObjectSchema = /* @__PURE__ */ z.compile(
  z.optional(z.nullable(z.object({}))),
);

export type EmptyObject = z.infer<typeof emptyObjectSchema>;

export const connectedSchema = /* @__PURE__ */ z.compile(
  z.object({
    time: z.number(),
  }),
);

export type Connected = z.infer<typeof connectedSchema>;

export const eventCursorSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
  }),
);

export type EventCursor = z.infer<typeof eventCursorSchema>;

export const messageResponseSchema = /* @__PURE__ */ z.compile(z.string());

export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const errorCodeResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    namespace: z.string(),
    error: z.string(),
    message: z.string(),
    propagate: z.optional(z.boolean()),
  }),
);

export type ErrorCodeResponse = z.infer<typeof errorCodeResponseSchema>;
