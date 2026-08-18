import { api, getRequestErrorMessage } from '@vibes/api';
import type { PlaybackState, SkipActionResponse } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import type { ClientActionFunctionArgs } from 'react-router';

export interface EmbedActionData {
  error?: string;
  intent: 'resetPlayback' | 'skip' | 'voteSong';
  playback?: PlaybackState;
  skip?: SkipActionResponse;
}

interface EmbedActionRequest {
  intent: 'resetPlayback' | 'skip' | 'voteSong';
  songId?: string;
}

export async function clientAction({
  params,
  request,
}: ClientActionFunctionArgs): Promise<EmbedActionData> {
  const body = (await request.json()) as EmbedActionRequest;
  const encodedRoomId = params['*']?.split('/').at(-1);
  const [decodeError, roomId] = safeWrap(() =>
    decodeURIComponent(encodedRoomId ?? ''),
  );
  if (!encodedRoomId || encodedRoomId.includes('/') || decodeError || !roomId) {
    return { error: 'Room ID is required', intent: body.intent };
  }

  if (body.intent === 'skip') {
    const [error, skip] = await api.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
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
    const [error, playback] = await api.get('/rooms/{id}/states', {
      id: roomId,
    });
    if (error || !playback) {
      return {
        error: await getRequestErrorMessage(error, 'Could not reset playback'),
        intent: body.intent,
      };
    }
    return { intent: body.intent, playback };
  }

  if (!body.songId) {
    return { error: 'Song ID is required', intent: body.intent };
  }
  const [error] = await api.post(
    '/rooms/{id}/songs/{songId}',
    { id: roomId, songId: body.songId },
    {},
  );
  if (error) {
    return {
      error: await getRequestErrorMessage(error, 'Could not add your vote'),
      intent: body.intent,
    };
  }
  return { intent: body.intent };
}
