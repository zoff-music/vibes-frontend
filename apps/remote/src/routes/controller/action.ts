import {
  createApiClient,
  getAPIErrorMessage,
  getRateLimitMessage,
} from '@vibes/api';
import type {
  PlaybackState,
  Room,
  SearchResponse,
  SessionResponse,
  YouTubeSearchResponse,
} from '@vibes/models';
import { parseISODuration } from '@vibes/shared';
import type { ClientActionFunctionArgs } from 'react-router';

export interface ControllerActionData {
  error?: string;
  intent: string;
  playback?: PlaybackState;
  room?: Room;
  searchResults?: SearchResponse | YouTubeSearchResponse;
  session?: SessionResponse;
}

export async function clientAction({
  request,
  params,
}: ClientActionFunctionArgs): Promise<ControllerActionData> {
  const remoteId = params.id ?? '';
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const roomId = String(formData.get('roomId') ?? '');
  const client = createApiClient({ 'X-Zoff-Remote-ID': remoteId });

  if (intent === 'changeRoom') {
    const nextRoomId = String(formData.get('nextRoomId') ?? '').trim();
    const [error] = await client.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId: nextRoomId },
    );
    return errorResult(intent, error);
  }

  if (intent === 'play' || intent === 'pause' || intent === 'seek') {
    const positionMs = Number(formData.get('positionMs') ?? 0);
    const [error, playback] = await client.put(
      '/rooms/{id}/states',
      { id: roomId },
      { action: intent, positionMs },
    );
    if (error || !playback) return errorResult(intent, error);
    return { intent, playback };
  }

  if (intent === 'skip') {
    const [error, result] = await client.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
    );
    if (error || !result) return errorResult(intent, error);
    return { intent, playback: result.playback };
  }

  if (intent === 'vote' || intent === 'remove') {
    const songId = String(formData.get('songId') ?? '');
    const [error] =
      intent === 'vote'
        ? await client.post(
            '/rooms/{id}/songs/{songId}',
            { id: roomId, songId },
            {},
          )
        : await client.delete('/rooms/{id}/songs/{songId}', {
            id: roomId,
            songId,
          });
    return errorResult(intent, error);
  }

  if (intent === 'joinAdmin') {
    const password = String(formData.get('password') ?? '');
    const [error, session] = await client.post(
      '/rooms/{id}/sessions',
      { id: roomId },
      { password },
    );
    if (error || !session) return errorResult(intent, error);

    const [notifyError] = await client.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId },
    );
    if (notifyError) return errorResult(intent, notifyError);
    return { intent, room: session.room, session };
  }

  if (intent === 'search') {
    const provider = String(formData.get('provider') ?? 'youtube');
    const query = String(formData.get('query') ?? '').trim();
    if (query.length < 3) {
      return { error: 'Enter at least 3 characters.', intent };
    }
    const [error, searchResults] =
      provider === 'youtube'
        ? await client.get('/youtube/search', {
            $search: { q: query },
          })
        : provider === 'soundcloud'
          ? await client.get('/soundcloud/search', { $search: { q: query } })
          : await client.get('/spotify/search', { $search: { q: query } });
    if (error || !searchResults) return errorResult(intent, error);
    return { intent, searchResults };
  }

  if (intent === 'addSong') {
    const sourceType = String(formData.get('sourceType') ?? 'youtube') as
      | 'soundcloud'
      | 'spotify'
      | 'youtube';
    const [error] = await client.post(
      '/rooms/{id}/songs',
      { id: roomId },
      {
        artist: String(formData.get('artist') ?? ''),
        duration: parseISODuration(String(formData.get('duration') ?? '')),
        providerUrl: String(formData.get('providerUrl') ?? ''),
        sourceId: String(formData.get('sourceId') ?? ''),
        sourceType,
        thumbnailUrl: String(formData.get('thumbnailUrl') ?? ''),
        title: String(formData.get('title') ?? ''),
      },
    );
    return errorResult(intent, error);
  }

  if (intent === 'updateSetting') {
    const setting = String(formData.get('setting') ?? '');
    const value = formData.get('value') === 'true';
    let settings = {};
    if (setting === 'skipAllowed') settings = { skipAllowed: value };
    if (setting === 'democraticSkip') settings = { democraticSkip: value };
    if (setting === 'loopQueue') settings = { loopQueue: value };
    if (setting === 'removeOnPlay') settings = { removeOnPlay: value };
    if (setting === 'allowDuplicates') settings = { allowDuplicates: value };
    if (setting === 'onlyAdminAddSongs') {
      settings = { onlyAdminAddSongs: value };
    }
    if (setting === 'public') settings = { public: value };
    const [error, room] = await client.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      { settings },
    );
    if (error || !room) return errorResult(intent, error);
    return { intent, room };
  }

  if (intent === 'updateMode') {
    const mode = String(formData.get('mode') ?? 'server') as 'host' | 'server';
    const [error, room] = await client.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      { mode },
    );
    if (error || !room) return errorResult(intent, error);
    return { intent, room };
  }

  if (intent === 'updateSources') {
    const enabledSources = formData.getAll('enabledSources').map(String);
    const [error, room] = await client.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      { settings: { enabledSources } },
    );
    if (error || !room) return errorResult(intent, error);
    return { intent, room };
  }

  return { error: 'Unknown remote action.', intent };
}

async function errorResult(intent: string, error: Error | null) {
  if (!error) return { intent };
  return {
    error:
      getRateLimitMessage(error) ??
      (await getAPIErrorMessage(error)) ??
      error.message,
    intent,
  } satisfies ControllerActionData;
}
