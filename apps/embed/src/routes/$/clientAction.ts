import {
  type ClientActionFunctionArgs,
  readSubmission,
} from '@kasperrt/smolter/preact';
import { api, getRequestErrorMessage } from '@vibes/api';
import type { PlaybackStateV2, SkipPlaylistItemResponse } from '@vibes/models';
import { safeWrap } from '@vibes/shared';

export interface EmbedActionData {
  error?: string;
  intent: 'resetPlayback' | 'skip' | 'votePlaylistItem';
  playback?: PlaybackStateV2;
  skip?: SkipPlaylistItemResponse;
}

interface EmbedActionRequest {
  intent: 'resetPlayback' | 'skip' | 'votePlaylistItem';
  playlistItemId?: string;
}

export async function clientAction({
  params,
  request,
}: ClientActionFunctionArgs): Promise<EmbedActionData> {
  const body = (await readSubmission(request)) as EmbedActionRequest;
  const encodedRoomId = params['*']?.split('/').at(-1);
  const [decodeError, roomId] = safeWrap(() =>
    decodeURIComponent(encodedRoomId ?? ''),
  );

  if (!encodedRoomId || encodedRoomId.includes('/') || decodeError || !roomId) {
    return { error: 'Room ID is required', intent: body.intent };
  }

  if (body.intent === 'skip') {
    const [error, skip] = await api.v2.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
      { signal: request.signal },
    );

    if (error || !skip) {
      return {
        error: await getRequestErrorMessage(error, 'Could not skip song'),
        intent: body.intent,
      };
    }

    return {
      intent: body.intent,
      playback: skip.playback,
      skip,
    };
  }

  if (body.intent === 'resetPlayback') {
    const [error, playback] = await api.v2.get(
      '/rooms/{id}/states',
      {
        id: roomId,
      },
      { signal: request.signal },
    );

    if (error || !playback) {
      return {
        error: await getRequestErrorMessage(error, 'Could not reset playback'),
        intent: body.intent,
      };
    }

    return { intent: body.intent, playback };
  }

  if (!body.playlistItemId) {
    return { error: 'Playlist item ID is required', intent: body.intent };
  }

  const [error] = await api.v3.post(
    '/rooms/{id}/items/{itemId}',
    { id: roomId, itemId: body.playlistItemId },
    {},
    { signal: request.signal },
  );

  if (error) {
    return {
      error: await getRequestErrorMessage(error, 'Could not add your vote'),
      intent: body.intent,
    };
  }

  return { intent: body.intent };
}
