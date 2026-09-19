import { z } from 'zod';

export const chatMessageMaxLength = 500;

export const roomMessageSchema = z.compile(
  z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    isAdmin: z.boolean(),
    kind: z.enum([
      'chat',
      'added',
      'voted',
      'deleted',
      'renamed',
      'skipped',
      'skipvoted',
    ]),
    text: z.string(),
    createdAt: z.number(),
  }),
);
export type RoomMessage = z.infer<typeof roomMessageSchema>;
export const createMessageSchema = z.compile(
  z.object({
    text: z
      .string()
      .trim()
      .min(1, 'Enter a message.')
      .max(chatMessageMaxLength, 'Messages can be at most 500 characters.'),
  }),
);
