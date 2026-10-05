import {
  api,
  getAPIErrorResponse,
  getHttpError,
  getRateLimitMessage,
} from '@vibes/api';
import type {
  AddPlaylistItemRequest,
  AddPlaylistItemResponse,
  AddPlaylistRequestV2,
  AddPlaylistResponse,
  CastingTokenResponse,
  PlaybackStateV2,
  ProviderItem,
  ProviderPlaylist,
  ProviderSearchResponse,
  RoomGenerationUpdate,
  RoomUpdateV2,
  RoomV2,
  SessionResponseV2,
  SkipPlaylistItemResponse,
} from '@vibes/models';
import type { ClientActionFunctionArgs } from 'react-router';

export type RoomActionIntent =
  | 'sendMessage'
  | 'addPlaylist'
  | 'addPlaylistItem'
  | 'castingToken'
  | 'generatePlaylist'
  | 'joinRoom'
  | 'playback'
  | 'providerPlaylist'
  | 'providerItem'
  | 'removePlaylistItem'
  | 'resetPlayback'
  | 'search'
  | 'skip'
  | 'updateRoom'
  | 'votePlaylistItem';

export interface RoomActionData {
  addPlaylist?: AddPlaylistResponse;
  addPlaylistItem?: AddPlaylistItemResponse;
  casting?: {
    roomId: string;
    token: CastingTokenResponse;
  };
  error?: string;
  errorAction?: 'adminLogin';
  intent: RoomActionIntent;
  generation?: RoomGenerationUpdate;
  playback?: PlaybackStateV2;
  playlist?: ProviderPlaylist;
  provider?: 'soundcloud' | 'youtube';
  room?: RoomV2;
  searchResults?: ProviderSearchResponse;
  session?: SessionResponseV2;
  skip?: SkipPlaylistItemResponse;
  item?: ProviderItem;
}

interface RoomActionRequest {
  text?: string;
  action?: 'pause' | 'play' | 'seek';
  force?: boolean;
  intent: RoomActionIntent;
  password?: string;
  positionMs?: number;
  prompt?: string;
  provider?: 'soundcloud' | 'youtube';
  room?: RoomUpdateV2;
  playlistItem?: AddPlaylistItemRequest;
  playlistItemId?: string;
  sourceId?: string;
  providerUrl?: string;
  playlist?: AddPlaylistRequestV2;
}

async function createErrorData(intent: RoomActionIntent, error: Error | null) {
  const apiError = error ? await getAPIErrorResponse(error) : null;
  const status = error ? getHttpError(error)?.response.status : null;

  if (apiError?.error === 'youtube_search_quota_exhausted') {
    return {
      error:
        'YouTube search has reached its daily limit for Zoff, not just you. It resets at midnight Pacific time. You can still try pasting a YouTube song or playlist link.',
      intent,
    } satisfies RoomActionData;
  }

  let permissionError: string | null = null;
  if (apiError?.error === 'song_room_admin_required') {
    permissionError =
      intent === 'addPlaylist'
        ? 'Only room admins can import playlists here.'
        : 'Only room admins can add songs here.';
  }
  if (intent === 'skip' && !apiError) {
    if (status === UNAUTHORIZED_STATUS) {
      permissionError = 'Rejoin the room before skipping songs.';
    }
    if (status === FORBIDDEN_STATUS) {
      permissionError =
        'You do not have permission to skip songs in this room.';
    }
  }
  if (
    intent === 'generatePlaylist' &&
    (status === UNAUTHORIZED_STATUS || status === FORBIDDEN_STATUS)
  ) {
    permissionError = 'Log in as admin to generate songs for this room.';
  }

  return {
    error:
      permissionError ??
      (error && getRateLimitMessage(error)) ??
      apiError?.message ??
      ((intent === 'skip' && 'Failed to skip. Please try again.') ||
        (intent === 'search' &&
          'Could not search for music. Please try again.') ||
        (intent === 'addPlaylist' &&
          'Failed to import the playlist. Please try again.') ||
        (intent === 'providerItem' && 'Could not load that item.') ||
        (intent === 'providerPlaylist' && 'Could not load that playlist.') ||
        'The request failed'),
    ...(apiError?.error === 'song_room_admin_required' && {
      errorAction: 'adminLogin' as const,
    }),
    intent,
  } satisfies RoomActionData;
}

const FORBIDDEN_STATUS = 403;

const UNAUTHORIZED_STATUS = 401;

export async function clientAction({
  request,
  params,
}: ClientActionFunctionArgs): Promise<RoomActionData> {
  const roomId = params.id;
  if (!roomId) {
    return {
      error: 'Room ID is required',
      intent: 'joinRoom',
    };
  }

  const body = (await request.json()) as RoomActionRequest;

  if (body.intent === 'sendMessage') {
    const [error] = await api.post(
      '/rooms/{id}/messages',
      { id: roomId },
      { text: body.text ?? '' },
      { retry: 0 },
    );
    if (error) return createErrorData(body.intent, error);
    return { intent: body.intent };
  }

  if (body.intent === 'joinRoom') {
    const [error, session] = await api.v2.post(
      '/rooms/{id}/sessions',
      { id: roomId },
      { password: body.password },
    );
    if (error || !session) {
      return createErrorData(body.intent, error);
    }

    return {
      intent: body.intent,
      room: session.room,
      session,
    };
  }

  if (body.intent === 'castingToken') {
    const [error, castingToken] = await api.post('/tokens/casting', null, {
      roomId,
    });
    if (error || !castingToken) {
      return createErrorData(body.intent, error);
    }
    return {
      casting: { roomId, token: castingToken },
      intent: body.intent,
    };
  }

  if (body.intent === 'updateRoom') {
    const [error, room] = await api.v2.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      body.room ?? {},
    );
    if (error || !room) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, room };
  }

  if (body.intent === 'generatePlaylist') {
    const prompt = body.prompt?.trim();
    if (!prompt) {
      return { error: 'Playlist prompt is required', intent: body.intent };
    }

    const [error, generation] = await api.post(
      '/rooms/{id}/generations',
      { id: roomId },
      { prompt },
    );
    if (error || !generation) {
      return createErrorData(body.intent, error);
    }

    return { generation, intent: body.intent };
  }

  if (body.intent === 'playback') {
    if (!body.action) {
      return { error: 'Playback action is required', intent: body.intent };
    }
    const [error, playback] = await api.v2.put(
      '/rooms/{id}/states',
      { id: roomId },
      { action: body.action, positionMs: body.positionMs },
    );
    if (error || !playback) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, playback };
  }

  if (body.intent === 'resetPlayback') {
    const [error, playback] = await api.v2.get('/rooms/{id}/states', {
      id: roomId,
    });
    if (error || !playback) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, playback };
  }

  if (body.intent === 'skip') {
    const [error, skip] = await api.v2.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
    );
    if (error || !skip) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, playback: skip.playback, skip };
  }

  if (body.intent === 'addPlaylistItem') {
    if (!body.playlistItem) {
      return { error: 'Song is required', intent: body.intent };
    }
    const [error, addPlaylistItem] = await api.v2.post(
      '/rooms/{id}/playlist-items',
      { id: roomId },
      body.playlistItem,
    );
    if (error || !addPlaylistItem) {
      return createErrorData(body.intent, error);
    }
    return { addPlaylistItem, intent: body.intent };
  }

  if (body.intent === 'addPlaylist') {
    if (!body.playlist) {
      return { error: 'Playlist is required', intent: body.intent };
    }
    const [error, addPlaylist] = await api.v2.post(
      '/rooms/{id}/playlists',
      { id: roomId },
      body.playlist,
    );
    if (error || !addPlaylist) {
      return createErrorData(body.intent, error);
    }
    return { addPlaylist, intent: body.intent };
  }

  if (body.intent === 'removePlaylistItem') {
    if (!body.playlistItemId) {
      return { error: 'Song ID is required', intent: body.intent };
    }
    const [error] = await api.v2.delete(
      '/rooms/{id}/playlist-items/{playlistItemId}',
      {
        id: roomId,
        playlistItemId: body.playlistItemId,
      },
    );
    if (error) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent };
  }

  if (body.intent === 'votePlaylistItem') {
    if (!body.playlistItemId) {
      return { error: 'Song ID is required', intent: body.intent };
    }
    const [error] = await api.v2.post(
      '/rooms/{id}/playlist-items/{playlistItemId}',
      { id: roomId, playlistItemId: body.playlistItemId },
      {},
    );
    if (error) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent };
  }

  if (body.intent === 'providerItem') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }

    if (body.provider === 'youtube') {
      if (!body.sourceId) {
        return { error: 'Video ID is required', intent: body.intent };
      }
      const [error, video] = await api.v2.get('/youtube/videos/{id}', {
        id: body.sourceId,
      });
      if (error || !video) {
        return createErrorData(body.intent, error);
      }
      return {
        intent: body.intent,
        item: {
          ...video,
          source: 'youtube',
        },
      };
    }

    if (!body.providerUrl) {
      return { error: 'SoundCloud URL is required', intent: body.intent };
    }
    const [error, item] = await api.v2.get('/soundcloud/items', {
      $search: { url: body.providerUrl },
    });
    if (error || !item) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, item };
  }

  if (body.intent === 'providerPlaylist') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }

    if (body.provider === 'youtube') {
      if (!body.sourceId) {
        return { error: 'Playlist ID is required', intent: body.intent };
      }
      const [error, playlist] = await api.v2.get('/youtube/playlists/{id}', {
        id: body.sourceId,
      });
      if (error || !playlist) {
        return createErrorData(body.intent, error);
      }
      return { intent: body.intent, playlist };
    }

    if (!body.providerUrl) {
      return { error: 'SoundCloud URL is required', intent: body.intent };
    }
    const [error, playlist] = await api.v2.get('/soundcloud/playlists', {
      $search: { url: body.providerUrl },
    });
    if (!error && playlist) {
      return { intent: body.intent, playlist };
    }

    const [itemError, item] = await api.v2.get('/soundcloud/items', {
      $search: { url: body.providerUrl },
    });
    if (itemError || !item) {
      return createErrorData(body.intent, itemError ?? error);
    }
    return { intent: 'providerItem', item };
  }

  if (body.intent === 'search') {
    const prompt = body.prompt?.trim() ?? '';
    if (!body.provider || prompt.length < MINIMUM_SEARCH_QUERY_LENGTH) {
      return {
        error: `Search queries must contain at least ${MINIMUM_SEARCH_QUERY_LENGTH} characters`,
        intent: body.intent,
      };
    }

    const [error, searchResults] = await api.v2.get(
      '/rooms/{id}/search/{provider}',
      { id: roomId, provider: body.provider, $search: { q: prompt } },
    );
    if (error || !searchResults) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, searchResults };
  }

  return { error: 'Unsupported room action', intent: body.intent };
}

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
