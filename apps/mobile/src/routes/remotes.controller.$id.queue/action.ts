import { createRoomQueueRequests } from '@vibes/api';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { createRemoteApi, getRequestErrorMessage } from '@/lib/api';

type ControllerQueueActionInput =
  | { intent: 'remove'; roomId: string; songId: string }
  | { intent: 'vote'; roomId: string; songId: string };

export interface ControllerQueueActionData {
  intent: 'success';
}

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<ControllerQueueActionData>> {
  const remoteId = params.id;
  const controllerToken = params.controllerToken;
  if (!remoteId || !controllerToken || !isControllerQueueActionInput(input)) {
    return { data: null, error: 'The remote queue request was invalid.' };
  }
  const requests = createRoomQueueRequests(
    createRemoteApi(remoteId, controllerToken),
  );
  const [error] =
    input.intent === 'vote'
      ? await requests.vote(input.roomId, input.songId, { signal })
      : await requests.removeSong(input.roomId, input.songId, { signal });
  if (error) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        input.intent === 'vote'
          ? 'Could not register vote.'
          : 'Could not remove song.',
      ),
    };
  }
  return { data: { intent: 'success' }, error: '' };
}

function isControllerQueueActionInput(
  input: unknown,
): input is ControllerQueueActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'remove' || input.intent === 'vote';
}
