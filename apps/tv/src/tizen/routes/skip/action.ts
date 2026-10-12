import { getRequestErrorMessage } from '@vibes/api';
import type { SkipPlaylistItemResponse } from '@vibes/models';
import type { ActionFunctionArgs } from 'react-router';
import { tizenApi } from '@/tizen/api';

export interface TizenSkipData {
  error: string;
  result: SkipPlaylistItemResponse | null;
}

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<TizenSkipData> {
  const roomId = params.id?.trim();
  if (request.method !== 'POST' || !roomId) {
    return { error: 'Choose a room before skipping.', result: null };
  }
  const [error, result] = await tizenApi.v2.post(
    '/rooms/{id}/skips',
    { id: roomId },
    {},
  );
  if (error || !result) {
    return {
      error: await getRequestErrorMessage(error, 'Could not skip. Try again.'),
      result: null,
    };
  }
  return { error: '', result };
}
