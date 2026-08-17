import { createCastingRequests } from '@vibes/api';
import type { CastingTokenResponse } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createCastingRequests(mobileApi);

export async function action({
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<CastingTokenResponse>> {
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
