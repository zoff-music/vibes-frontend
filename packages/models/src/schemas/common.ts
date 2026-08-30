import { z } from 'zod';

export const emptyObjectSchema = z.compile(z.object({}).nullable().optional());
export type EmptyObject = z.infer<typeof emptyObjectSchema>;

export const connectedSchema = z.compile(z.object({ time: z.number() }));
export type Connected = z.infer<typeof connectedSchema>;

export const eventCursorSchema = z.compile(z.object({ id: z.string() }));
export type EventCursor = z.infer<typeof eventCursorSchema>;

export const messageResponseSchema = z.compile(z.string());
export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const errorCodeResponseSchema = z.compile(
  z.object({
    namespace: z.string(),
    error: z.string(),
    message: z.string(),
    propagate: z.boolean().optional(),
  }),
);
export type ErrorCodeResponse = z.infer<typeof errorCodeResponseSchema>;
