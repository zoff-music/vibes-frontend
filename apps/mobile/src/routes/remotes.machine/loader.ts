import { createRemoteRequests } from '@vibes/api';
import type { RemoteStatusV2 } from '@vibes/models';
import type { RequestArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createRemoteRequests(mobileApi);

export async function loader({
  signal,
}: RequestArgs): Promise<RequestResult<RemoteStatusV2>> {
  const [error, remote] = await requests.fetchOwnedRemote({ signal });

  if (error || !remote) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        'Could not load remote control status.',
      ),
    };
  }

  return { data: remote, error: '' };
}
