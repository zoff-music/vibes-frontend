import { type RoomType, roomTypeSchema } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import * as v from 'valibot';

const pendingGenerationSchema = v.object({
  id: v.pipe(v.string(), v.regex(/^[1-9]\d*$/)),
  prompt: v.string(),
  createdAt: v.number(),
  roomType: roomTypeSchema,
});

export type PendingGeneration = v.InferOutput<typeof pendingGenerationSchema>;

export function readPendingGeneration(roomType: RoomType) {
  if (typeof window === 'undefined') return null;

  const [error, pending] = safeWrap(() => {
    const value = sessionStorage.getItem(`zoff:generation:${roomType}`);
    if (!value) return null;

    return v.parse(pendingGenerationSchema, JSON.parse(value));
  });

  if (
    error ||
    !pending ||
    pending.roomType !== roomType ||
    Date.now() - pending.createdAt > 24 * 60 * 60 * 1000
  )
    return null;

  return pending;
}

export function savePendingGeneration(
  roomType: RoomType,
  pending: PendingGeneration,
) {
  safeWrap(() =>
    sessionStorage.setItem(
      `zoff:generation:${roomType}`,
      JSON.stringify(pending),
    ),
  );
}

export function clearPendingGeneration(roomType: RoomType, id: string) {
  if (readPendingGeneration(roomType)?.id !== id) return;

  safeWrap(() => sessionStorage.removeItem(`zoff:generation:${roomType}`));
}
