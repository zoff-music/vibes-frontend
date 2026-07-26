import {
  api,
  getAPIErrorMessage,
  getHttpError,
  getRateLimitMessage,
} from '@vibes/api';
import type {
  AddSongRequest,
  AddSongResponse,
  PlaybackState,
  ProviderToken,
  Room,
  RoomGenerationUpdate,
  RoomUpdate,
  SearchResponse,
  SearchResult,
  SessionResponse,
  SkipActionResponse,
  YouTubeSearchResponse,
} from '@vibes/models';
import type { ClientActionFunctionArgs } from 'react-router';

export type RoomActionIntent =
  | 'addSong'
  | 'generatePlaylist'
  | 'joinRoom'
  | 'playback'
  | 'providerToken'
  | 'providerTrack'
  | 'removeSong'
  | 'resetPlayback'
  | 'search'
  | 'skip'
  | 'updateRoom'
  | 'voteSong';

export interface RoomActionData {
  addSong?: AddSongResponse;
  error?: string;
  intent: RoomActionIntent;
  generation?: RoomGenerationUpdate;
  playback?: PlaybackState;
  provider?: 'soundcloud' | 'spotify' | 'youtube';
  providerToken?: ProviderToken;
  room?: Room;
  searchResults?: SearchResponse | YouTubeSearchResponse;
  session?: SessionResponse;
  skip?: SkipActionResponse;
  track?: SearchResult;
}

interface RoomActionRequest {
  action?: 'pause' | 'play' | 'seek';
  force?: boolean;
  intent: RoomActionIntent;
  password?: string;
  positionMs?: number;
  prompt?: string;
  provider?: 'soundcloud' | 'spotify' | 'youtube';
  room?: RoomUpdate;
  song?: AddSongRequest;
  songId?: string;
  providerUrl?: string;
}

async function createErrorData(intent: RoomActionIntent, error: Error | null) {
  const apiErrorMessage = error ? await getAPIErrorMessage(error) : null;
  const status = error ? getHttpError(error)?.response.status : null;
  let permissionError: string | null = null;
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
      apiErrorMessage ??
      error?.message ??
      'The request failed',
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

  if (body.intent === 'joinRoom') {
    const [error, session] = await api.post(
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

  if (body.intent === 'updateRoom') {
    const [error, room] = await api.patch(
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
    const [error, playback] = await api.put(
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
    const [error, playback] = await api.get('/rooms/{id}/states', {
      id: roomId,
    });
    if (error || !playback) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, playback };
  }

  if (body.intent === 'skip') {
    const [error, skip] = await api.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
    );
    if (error || !skip) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, playback: skip.playback, skip };
  }

  if (body.intent === 'addSong') {
    if (!body.song) {
      return { error: 'Song is required', intent: body.intent };
    }
    const [error, addSong] = await api.post(
      '/rooms/{id}/songs',
      { id: roomId },
      body.song,
    );
    if (error || !addSong) {
      return createErrorData(body.intent, error);
    }
    return { addSong, intent: body.intent };
  }

  if (body.intent === 'removeSong') {
    if (!body.songId) {
      return { error: 'Song ID is required', intent: body.intent };
    }
    const [error] = await api.delete('/rooms/{id}/songs/{songId}', {
      id: roomId,
      songId: body.songId,
    });
    if (error) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent };
  }

  if (body.intent === 'voteSong') {
    if (!body.songId) {
      return { error: 'Song ID is required', intent: body.intent };
    }
    const [error] = await api.post(
      '/rooms/{id}/songs/{songId}',
      { id: roomId, songId: body.songId },
      {},
    );
    if (error) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent };
  }

  if (body.intent === 'providerToken') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }
    const [error, providerToken] = await api.get('/tokens/{provider}', {
      provider: body.provider,
    });
    if (error || !providerToken) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, provider: body.provider, providerToken };
  }

  if (body.intent === 'providerTrack') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }

    if (body.provider === 'youtube') {
      if (!body.songId) {
        return { error: 'Video ID is required', intent: body.intent };
      }
      const [error, video] = await api.get('/youtube/videos/{id}', {
        id: body.songId,
      });
      if (error || !video) {
        return createErrorData(body.intent, error);
      }
      return {
        intent: body.intent,
        track: {
          ...video,
          source: 'youtube',
        },
      };
    }

    if (body.provider === 'spotify') {
      if (!body.songId) {
        return { error: 'Track ID is required', intent: body.intent };
      }
      const [error, track] = await api.get('/spotify/tracks/{id}', {
        id: body.songId,
      });
      if (error || !track) {
        return createErrorData(body.intent, error);
      }
      return { intent: body.intent, track };
    }

    if (!body.providerUrl) {
      return { error: 'SoundCloud URL is required', intent: body.intent };
    }
    const [error, track] = await api.get('/soundcloud/tracks', {
      $search: { url: body.providerUrl },
    });
    if (error || !track) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, track };
  }

  if (body.intent === 'search') {
    const prompt = body.prompt?.trim() ?? '';
    if (!body.provider || prompt.length < MINIMUM_SEARCH_QUERY_LENGTH) {
      return {
        error: `Search queries must contain at least ${MINIMUM_SEARCH_QUERY_LENGTH} characters`,
        intent: body.intent,
      };
    }

    if (body.provider === 'youtube') {
      const [error, searchResults] = await api.get('/youtube/search', {
        $search: { q: prompt },
      });
      if (error || !searchResults) {
        return createErrorData(body.intent, error);
      }
      return { intent: body.intent, searchResults };
    }

    if (body.provider === 'spotify') {
      const [error, searchResults] = await api.get('/spotify/search', {
        $search: { q: prompt },
      });
      if (error || !searchResults) {
        return createErrorData(body.intent, error);
      }
      return { intent: body.intent, searchResults };
    }

    const [error, searchResults] = await api.get('/soundcloud/search', {
      $search: { q: prompt },
    });
    if (error || !searchResults) {
      return createErrorData(body.intent, error);
    }
    return { intent: body.intent, searchResults };
  }

  return { error: 'Unsupported room action', intent: body.intent };
}

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
