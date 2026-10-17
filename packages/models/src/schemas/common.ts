import * as v from 'valibot';
import { objectInputSchema } from './object-input';

export const emptyObjectSchema = /* @__PURE__ */ v.optional(
  v.nullable(v.pipe(objectInputSchema, v.object({}))),
);

export type EmptyObject = v.InferOutput<typeof emptyObjectSchema>;

export const connectedSchema = /* @__PURE__ */ v.object({
  time: v.pipe(v.number(), v.finite()),
});

export type Connected = v.InferOutput<typeof connectedSchema>;

export const eventCursorSchema = /* @__PURE__ */ v.object({
  id: v.string(),
});

export type EventCursor = v.InferOutput<typeof eventCursorSchema>;

export const messageResponseSchema = /* @__PURE__ */ v.string();

export type MessageResponse = v.InferOutput<typeof messageResponseSchema>;

export const errorCodeResponseSchema = /* @__PURE__ */ v.object({
  namespace: v.string(),
  error: v.string(),
  message: v.string(),
  propagate: v.optional(v.boolean()),
});

export type ErrorCodeResponse = v.InferOutput<typeof errorCodeResponseSchema>;
