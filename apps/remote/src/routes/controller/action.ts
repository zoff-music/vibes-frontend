import { createApiClient, getRequestErrorMessage } from '@vibes/api';
import type {
  PlaybackStateV2,
  ProviderSearchResponse,
  RoomV2,
  SessionResponseV2,
} from '@vibes/models';
import { isSourceType } from '@vibes/models';
import { parseISODuration } from '@vibes/shared';
import type { ClientActionFunctionArgs } from 'react-router';

export interface ControllerActionData {
  error?: string;
  intent: string;
  playback?: PlaybackStateV2;
  room?: RoomV2;
  searchResults?: ProviderSearchResponse;
  session?: SessionResponseV2;
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
    const [error] = await client.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId: nextRoomId },
    );
    return errorResult(intent, error);
  }

  if (intent === 'play' || intent === 'pause' || intent === 'seek') {
    const positionMs = Number(formData.get('positionMs') ?? 0);
    const [error, playback] = await client.v2.put(
      '/rooms/{id}/states',
      { id: roomId },
      { action: intent, positionMs },
    );
    if (error || !playback) return errorResult(intent, error);
    return { intent, playback };
  }

  if (intent === 'skip') {
    const [error, result] = await client.v2.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
    );
    if (error || !result) return errorResult(intent, error);
    return { intent, playback: result.playback };
  }

  if (intent === 'vote' || intent === 'remove') {
    const playlistItemId = String(formData.get('playlistItemId') ?? '');
    const [error] =
      intent === 'vote'
        ? await client.v2.post(
            '/rooms/{id}/playlist-items/{playlistItemId}',
            { id: roomId, playlistItemId },
            {},
          )
        : await client.v2.delete(
            '/rooms/{id}/playlist-items/{playlistItemId}',
            {
              id: roomId,
              playlistItemId,
            },
          );
    return errorResult(intent, error);
  }

  if (intent === 'joinAdmin') {
    const password = String(formData.get('password') ?? '');
    const [error, session] = await client.v2.post(
      '/rooms/{id}/sessions',
      { id: roomId },
      { password },
    );
    if (error || !session) return errorResult(intent, error);

    const [notifyError] = await client.v2.patch(
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
    if (!isSourceType(provider)) {
      return { error: 'That provider is not supported.', intent };
    }
    const [error, searchResults] = await client.v2.get(
      '/rooms/{id}/search/{provider}',
      { id: roomId, provider, $search: { q: query } },
    );
    if (error || !searchResults) return errorResult(intent, error);
    return { intent, searchResults };
  }

  if (intent === 'addPlaylistItem') {
    const sourceType = String(formData.get('sourceType') ?? 'youtube');
    if (!isSourceType(sourceType)) {
      return { error: 'That music provider is not supported.', intent };
    }
    const [error] = await client.v2.post(
      '/rooms/{id}/playlist-items',
      { id: roomId },
      {
        publisher: String(formData.get('publisher') ?? ''),
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
    if (setting === 'removeOnPlay') settings = { removeOnPlay: value };
    if (setting === 'allowDuplicates') settings = { allowDuplicates: value };
    if (setting === 'onlyAdminAddPlaylistItems') {
      settings = { onlyAdminAddPlaylistItems: value };
    }
    if (setting === 'public') settings = { public: value };
    const [error, room] = await client.v2.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      { settings },
    );
    if (error || !room) return errorResult(intent, error);
    return { intent, room };
  }

  if (intent === 'updateMode') {
    const mode = String(formData.get('mode') ?? 'server') as 'host' | 'server';
    const [error, room] = await client.v2.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      { mode },
    );
    if (error || !room) return errorResult(intent, error);
    return { intent, room };
  }

  if (intent === 'updateSources') {
    const enabledSources = formData
      .getAll('enabledSources')
      .map(String)
      .filter(isSourceType);
    const [error, room] = await client.v2.patch(
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
  return {
    error: await getRequestErrorMessage(error, getActionErrorFallback(intent)),
    intent,
  } satisfies ControllerActionData;
}

function getActionErrorFallback(intent: string) {
  if (intent === 'joinAdmin') {
    return 'Could not authenticate with that password.';
  }
  if (intent === 'search') {
    return 'Could not search right now. Please try again.';
  }
  if (intent === 'addPlaylistItem') {
    return 'Could not add that song. Please try again.';
  }
  return 'Could not complete that remote action. Please try again.';
}
