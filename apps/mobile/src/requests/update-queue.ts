import { createRoomQueueRequests } from '@vibes/api';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type RoomQueueActionInput =
  | { intent: 'remove'; playlistItemId: string }
  | { intent: 'vote'; playlistItemId: string };

export interface RoomQueueActionData {
  intent: 'success';
}

const requests = createRoomQueueRequests(mobileApi);

export async function updateQueue({
  input,
  params,
  signal,
}: MutationArgs): Promise<RequestResult<RoomQueueActionData>> {
  const roomId = params.id;

  if (!roomId || !isRoomQueueActionInput(input)) {
    return { data: null, error: 'The queue request was invalid.' };
  }

  const [error] =
    input.intent === 'vote'
      ? await requests.vote(roomId, input.playlistItemId, { signal })
      : await requests.removePlaylistItem(roomId, input.playlistItemId, {
          signal,
        });

  if (error) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        input.intent === 'vote'
          ? 'Could not add your vote.'
          : 'Could not remove this item.',
      ),
    };
  }

  return { data: { intent: 'success' }, error: '' };
}

function isRoomQueueActionInput(input: unknown): input is RoomQueueActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;

  return input.intent === 'remove' || input.intent === 'vote';
}
