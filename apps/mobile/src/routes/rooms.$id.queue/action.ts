import { createRoomQueueRequests } from '@vibes/api';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type RoomQueueActionInput =
  | { intent: 'remove'; songId: string }
  | { intent: 'vote'; songId: string };

export interface RoomQueueActionData {
  intent: 'success';
}

const requests = createRoomQueueRequests(mobileApi);

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<RoomQueueActionData>> {
  const roomId = params.id;
  if (!roomId || !isRoomQueueActionInput(input)) {
    return { data: null, error: 'The queue request was invalid.' };
  }
  const [error] =
    input.intent === 'vote'
      ? await requests.vote(roomId, input.songId, { signal })
      : await requests.removeSong(roomId, input.songId, { signal });
  if (error) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        input.intent === 'vote'
          ? 'Could not add your vote.'
          : 'Could not remove this song.',
      ),
    };
  }
  return { data: { intent: 'success' }, error: '' };
}

function isRoomQueueActionInput(input: unknown): input is RoomQueueActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'remove' || input.intent === 'vote';
}
