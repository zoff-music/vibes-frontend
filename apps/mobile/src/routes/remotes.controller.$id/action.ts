import { createRemoteRequests } from '@vibes/api';
import type { RemoteSession, RemoteUpdateRequest } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';

type ControllerRemoteActionInput =
  | { intent: 'changeRoom'; roomId: string }
  | {
      intent: 'pair';
      pairingCode?: string;
      pairingToken?: string;
    }
  | { intent: 'remoteState'; request: RemoteUpdateRequest };

export type ControllerRemoteActionData =
  | { intent: 'paired'; session: RemoteSession }
  | { intent: 'success' };

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<ControllerRemoteActionData>> {
  const remoteId = params.id;
  if (!remoteId || !isControllerRemoteActionInput(input)) {
    return { data: null, error: 'The remote request was invalid.' };
  }
  if (input.intent === 'pair') {
    const [error, session] = await createRemoteRequests(mobileApi).pairRemote(
      remoteId,
      input.pairingToken
        ? { pairingToken: input.pairingToken }
        : { pairingCode: input.pairingCode ?? '' },
      { signal },
    );
    if (error || !session) {
      return failure(
        error,
        'Could not pair this remote. Check the pairing details.',
      );
    }
    return { data: { intent: 'paired', session }, error: '' };
  }
  const controllerToken = params.controllerToken;
  if (!controllerToken) {
    return { data: null, error: 'Remote credentials are required.' };
  }
  const client = createRemoteApi(remoteId, controllerToken);
  const remoteRequests = createRemoteRequests(client);
  if (input.intent === 'changeRoom') {
    const [error] = await remoteRequests.updateRemote(
      remoteId,
      {
        roomId: input.roomId,
      },
      { signal },
    );
    if (error) return failure(error, 'Could not change the controlled room.');
    return { data: { intent: 'success' }, error: '' };
  }
  if (input.intent === 'remoteState') {
    const [error] = await remoteRequests.updateRemote(remoteId, input.request, {
      signal,
    });
    if (error) return failure(error, 'Could not update remote playback.');
    return { data: { intent: 'success' }, error: '' };
  }
  return { data: null, error: 'That remote request is not supported.' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<ControllerRemoteActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isControllerRemoteActionInput(
  input: unknown,
): input is ControllerRemoteActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return ['changeRoom', 'pair', 'remoteState'].includes(String(input.intent));
}
