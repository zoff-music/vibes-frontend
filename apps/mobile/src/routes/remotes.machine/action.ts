import { createRemoteRequests } from '@vibes/api';
import type { RemotePairingV2, RemoteUpdateRequestV2 } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type MachineRemoteActionInput =
  | { intent: 'disable'; remoteId: string }
  | { intent: 'enable'; request: RemoteUpdateRequestV2 };

export type MachineRemoteActionData =
  | { intent: 'disabled' }
  | { intent: 'enabled'; pairing: RemotePairingV2 };

const requests = createRemoteRequests(mobileApi);

export async function action({
  input,
  signal,
}: ActionFunctionArgs): Promise<DataResult<MachineRemoteActionData>> {
  if (!isMachineRemoteActionInput(input)) {
    return { data: null, error: 'The remote request was invalid.' };
  }
  if (input.intent === 'disable') {
    const [error] = await requests.deleteRemote(input.remoteId, { signal });
    if (error) {
      return failure(error, 'Could not disable remote control.');
    }
    return { data: { intent: 'disabled' }, error: '' };
  }
  const [error, pairing] = await requests.createRemote(input.request, {
    signal,
  });
  if (error || !pairing) {
    return failure(error, 'Could not enable remote control.');
  }
  return { data: { intent: 'enabled', pairing }, error: '' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<MachineRemoteActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isMachineRemoteActionInput(
  input: unknown,
): input is MachineRemoteActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'disable' || input.intent === 'enable';
}
