import { createRemoteRequests } from '@vibes/api';
import type { RemoteStatus } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createRemoteRequests(mobileApi);

export async function loader({
  signal,
}: LoaderFunctionArgs): Promise<DataResult<RemoteStatus>> {
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
