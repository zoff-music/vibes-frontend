import { createSessionProfileRequests } from '@vibes/api';
import type { SessionProfile } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createSessionProfileRequests(mobileApi);

export async function loader({
  signal,
}: LoaderFunctionArgs): Promise<DataResult<SessionProfile>> {
  const [error, profile] = await requests.fetchSessionProfile({ signal });
  if (error || !profile) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not load your name.'),
    };
  }

  return { data: profile, error: '' };
}
