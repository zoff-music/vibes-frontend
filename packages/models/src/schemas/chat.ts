import * as z from 'zod/mini';

export const chatMessageMaxLength = 500;

export const roomMessageSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    isAdmin: z.boolean(),
    isModerator: z.optional(z.boolean()),
    isHost: z.optional(z.boolean()),
    activity: z.optional(z.boolean()),
    kind: z.enum([
      'chat',
      'added',
      'voted',
      'deleted',
      'renamed',
      'skipped',
      'skipvoted',
      'settings',
    ]),
    text: z.string(),
    createdAt: z.number(),
  }),
);
export type RoomMessage = z.infer<typeof roomMessageSchema>;
export const createMessageSchema = /* @__PURE__ */ z.compile(
  z.object({
    text: z
      .string()
      .check(
        z.trim(),
        z.minLength(1, 'Enter a message.'),
        z.maxLength(
          chatMessageMaxLength,
          'Messages can be at most 500 characters.',
        ),
      ),
  }),
);
