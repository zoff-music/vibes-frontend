import { createRoomPlaybackRequests } from '@vibes/api';
import type { PlaybackState, SkipActionResponse } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type RoomPlaybackActionInput =
  | {
      action: 'pause' | 'play' | 'seek';
      intent: 'update';
      positionMs?: number;
    }
  | { intent: 'skip' };

export type RoomPlaybackActionData =
  | { intent: 'skip'; response: SkipActionResponse }
  | { intent: 'updated'; playback: PlaybackState };

const requests = createRoomPlaybackRequests(mobileApi);

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<RoomPlaybackActionData>> {
  const roomId = params.id;
  if (!roomId || !isRoomPlaybackActionInput(input)) {
    return { data: null, error: 'The playback request was invalid.' };
  }
  if (input.intent === 'skip') {
    const [error, response] = await requests.skip(roomId, { signal });
    if (error || !response) return failure(error, 'Could not skip this song.');
    return { data: { intent: 'skip', response }, error: '' };
  }
  const [error, playback] = await requests.updatePlayback(
    roomId,
    input.action,
    input.positionMs,
    { signal },
  );
  if (error || !playback) return failure(error, 'Could not update playback.');
  return { data: { intent: 'updated', playback }, error: '' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<RoomPlaybackActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isRoomPlaybackActionInput(
  input: unknown,
): input is RoomPlaybackActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'skip' || input.intent === 'update';
}
