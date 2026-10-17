import { createCastingRequests } from '@vibes/api';
import type { CastingTokenResponse } from '@vibes/models';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createCastingRequests(mobileApi);

export async function action({
  params,
  signal,
}: MutationArgs): Promise<RequestResult<CastingTokenResponse>> {
  const roomId = params.roomId;

  if (!roomId) return { data: null, error: 'A room is required.' };

  const [error, token] = await requests.createCastingToken(roomId, { signal });

  if (error || !token) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not start casting.'),
    };
  }

  return { data: token, error: '' };
}
