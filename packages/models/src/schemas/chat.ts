import * as v from 'valibot';
import { chatMessageMaxLength } from '../limits';

export const roomMessageSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  userId: v.string(),
  name: v.string(),
  isAdmin: v.boolean(),
  isModerator: v.optional(v.boolean()),
  isHost: v.optional(v.boolean()),
  activity: v.optional(v.boolean()),
  kind: v.picklist([
    'chat',
    'added',
    'voted',
    'deleted',
    'renamed',
    'skipped',
    'skipvoted',
    'settings',
  ]),
  text: v.string(),
  createdAt: v.pipe(v.number(), v.finite()),
});

export type RoomMessage = v.InferOutput<typeof roomMessageSchema>;
export const createMessageSchema = /* @__PURE__ */ v.object({
  text: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Enter a message.'),
    v.maxLength(
      chatMessageMaxLength,
      'Messages can be at most 500 characters.',
    ),
  ),
});
