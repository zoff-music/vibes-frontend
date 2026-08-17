import {
  createApiClient,
  getAPIErrorMessage,
  getRateLimitMessage,
} from '@vibes/api';
import { safeWrapAsync } from '@vibes/shared';
import type { ActionFunctionArgs } from 'react-router';

export interface CastActionData {
  error?: string;
  intent: 'reportPlaybackFailure';
  ok: boolean;
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<CastActionData> {
  const [formError, formData] = await safeWrapAsync(request.formData());
  if (formError || !formData) {
    return {
      error: 'The playback problem could not be reported.',
      intent: 'reportPlaybackFailure',
      ok: false,
    };
  }

  const castToken = formData.get('castToken');
  const roomId = formData.get('roomId');
  const songId = formData.get('songId');
  if (
    typeof castToken !== 'string' ||
    typeof roomId !== 'string' ||
    typeof songId !== 'string'
  ) {
    return {
      error: 'The playback problem could not be reported.',
      intent: 'reportPlaybackFailure',
      ok: false,
    };
  }

  const client = createApiClient({ Authorization: `Bearer ${castToken}` });
  const [requestError] = await client.post(
    '/rooms/{id}/playbackfailures',
    { id: roomId },
    { songId },
  );
  if (requestError) {
    const apiError = await getAPIErrorMessage(requestError);
    return {
      error:
        getRateLimitMessage(requestError) ??
        apiError ??
        'The playback problem could not be reported.',
      intent: 'reportPlaybackFailure',
      ok: false,
    };
  }

  return { intent: 'reportPlaybackFailure', ok: true };
}
