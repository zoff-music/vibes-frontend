import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import { createApiClient, getRequestErrorMessage } from '@vibes/api';

import {
  isSourceType,
  type PlaybackStateV2,
  type ProviderSearchResponse,
  type RoomV2,
  type SessionResponseV2,
} from '@vibes/models';
import {
  getEstimatedServerTimeMs,
  parseISODuration,
  useRoomStore,
} from '@vibes/shared';

export interface ControllerActionData {
  error?: string;
  intent: string;
  playback?: PlaybackStateV2;
  room?: RoomV2;
  roomId?: string;
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

  if (intent === 'partyMode') {
    if (!roomId) return { intent, error: 'Choose a room first.' };

    const [error] = await client.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId, partyMode: formData.get('partyMode') === 'true' },
      { signal: request.signal },
    );

    return errorResult(intent, error);
  }

  if (intent === 'resetPosition') {
    const [error, playback] = await client.v2.get(
      '/rooms/{id}/states',
      {
        id: roomId,
      },
      { signal: request.signal },
    );

    if (error || !playback) return errorResult(intent, error);

    const elapsed = playback.isPlaying
      ? Math.max(0, getEstimatedServerTimeMs() - playback.serverTimeMs)
      : 0;
    const duration = (playback.currentPlaylistItem?.duration ?? 0) * 1_000;
    const [updateError] = await client.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      {
        currentPlaylistItemId: playback.currentPlaylistItem?.id ?? '',
        playbackIsPlaying: playback.isPlaying,
        playbackPositionMs: Math.min(
          playback.positionMs + elapsed,
          duration || Number.MAX_VALUE,
        ),
      },
      { signal: request.signal },
    );

    return errorResult(intent, updateError);
  }

  if (intent === 'changeRoom') {
    const nextRoomId = String(formData.get('nextRoomId') ?? '').trim();
    const [error] = await client.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId: nextRoomId },
      { signal: request.signal },
    );

    return errorResult(intent, error);
  }

  if (intent === 'play' || intent === 'pause' || intent === 'seek') {
    const positionMs = Number(formData.get('positionMs') ?? 0);
    const room = useRoomStore.getState().room;
    const hasHostAuthority =
      room?.id === roomId &&
      room.mode === 'host' &&
      Boolean(room.userId) &&
      room.hostId === room.userId;

    if (intent === 'seek' && room?.mode === 'host' && !hasHostAuthority) {
      return {
        intent,
        error: 'Only the host can seek for everyone in this room.',
      };
    }

    if (intent !== 'seek' && !hasHostAuthority) {
      const [error] = await client.v2.patch(
        '/remotes/{id}',
        { id: remoteId },
        {
          currentPlaylistItemId: String(formData.get('itemId') ?? ''),
          playbackIsPlaying: intent === 'play',
          playbackPositionMs: positionMs,
        },
        { signal: request.signal },
      );

      return errorResult(intent, error);
    }

    const [error, playback] = await client.v2.put(
      '/rooms/{id}/states',
      { id: roomId },
      { action: intent, positionMs },
      { signal: request.signal },
    );

    if (error || !playback) return errorResult(intent, error);

    return { intent, playback, roomId };
  }

  if (intent === 'skip') {
    const [error, result] = await client.v2.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
      { signal: request.signal },
    );

    if (error || !result) return errorResult(intent, error);

    return { intent, playback: result.playback, roomId };
  }

  if (intent === 'vote' || intent === 'remove') {
    const playlistItemId = String(formData.get('playlistItemId') ?? '');
    const [error] =
      intent === 'vote'
        ? await client.v3.post(
            '/rooms/{id}/items/{itemId}',
            { id: roomId, itemId: playlistItemId },
            {},
            { signal: request.signal },
          )
        : await client.v3.delete(
            '/rooms/{id}/items/{itemId}',
            {
              id: roomId,
              itemId: playlistItemId,
            },
            { signal: request.signal },
          );

    return errorResult(intent, error);
  }

  if (intent === 'joinAdmin') {
    const password = String(formData.get('password') ?? '');
    const [error, session] = await client.v2.post(
      '/rooms/{id}/sessions',
      { id: roomId },
      { password },
      { signal: request.signal },
    );

    if (error || !session) return errorResult(intent, error);

    const [notifyError] = await client.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      { roomId },
      { signal: request.signal },
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
      { signal: request.signal, retry: 0 },
    );

    if (error || !searchResults) return errorResult(intent, error);

    return { intent, searchResults };
  }

  if (intent === 'addPlaylistItem') {
    const sourceType = String(formData.get('sourceType') ?? 'youtube');

    if (!isSourceType(sourceType)) {
      return { error: 'That music provider is not supported.', intent };
    }

    const [error] = await client.v3.post(
      '/rooms/{id}/items',
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
      { signal: request.signal },
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
      { signal: request.signal },
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
      { signal: request.signal },
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
      { signal: request.signal },
    );

    if (error || !room) return errorResult(intent, error);

    return { intent, room };
  }

  return { error: 'Unknown remote action.', intent };
}

async function errorResult(intent: string, error: Error | null) {
  if (!error) return { intent } satisfies ControllerActionData;

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
