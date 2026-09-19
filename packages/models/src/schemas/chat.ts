import { z } from 'zod';

export const roomMessageSchema = z.compile(
  z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    isAdmin: z.boolean(),
    kind: z.enum(['chat', 'added', 'voted', 'deleted', 'renamed']),
    text: z.string(),
    createdAt: z.number(),
  }),
);
export type RoomMessage = z.infer<typeof roomMessageSchema>;
export const createMessageSchema = z.compile(
  z.object({ text: z.string().trim().min(1).max(500) }),
);
