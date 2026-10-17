import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import {
  createApiClient,
  getAPIErrorMessage,
  getRateLimitMessage,
} from '@vibes/api';
import { safeWrapAsync } from '@vibes/shared';

export interface CastActionData {
  error?: string;
  intent: 'reportPlaybackFailure';
  ok: boolean;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<CastActionData> {
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
  const playlistItemId = formData.get('playlistItemId');

  if (
    typeof castToken !== 'string' ||
    typeof roomId !== 'string' ||
    typeof playlistItemId !== 'string'
  ) {
    return {
      error: 'The playback problem could not be reported.',
      intent: 'reportPlaybackFailure',
      ok: false,
    };
  }

  const client = createApiClient({ Authorization: `Bearer ${castToken}` });
  const [requestError] = await client.v2.post(
    '/rooms/{id}/failures',
    { id: roomId },
    { playlistItemId },
    { signal: request.signal },
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
