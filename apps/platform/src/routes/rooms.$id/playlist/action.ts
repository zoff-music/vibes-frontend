import { api } from '@vibes/api';
import type { RoomActionData, RoomActionRequest } from '../action';
import { createErrorData } from '../error';

export async function playlistAction(
  roomId: string,
  body: RoomActionRequest,
  signal: AbortSignal,
): Promise<RoomActionData> {
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

  if (body.intent === 'providerItem') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }

    if (body.provider === 'youtube') {
      if (!body.sourceId) {
        return { error: 'Video ID is required', intent: body.intent };
      }

      const [error, video] = await api.v2.get(
        '/youtube/videos/{id}',
        { id: body.sourceId },
        { signal },
      );

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

    const [error, item] = await api.v2.get(
      '/soundcloud/items',
      { $search: { url: body.providerUrl } },
      { signal },
    );

    if (error || !item) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, item };
  }

  if (body.intent === 'providerPlaylist') {
    if (!body.provider) {
      return { error: 'Provider is required', intent: body.intent };
    }

    const [roomError, room] = await api.v2.get(
      '/rooms/{id}',
      { id: roomId },
      { signal },
    );

    if (roomError || !room) return createErrorData(body.intent, roomError);
    if (room.roomType === 'WATCH' && body.provider !== 'youtube') {
      return {
        error: 'Watch rooms support YouTube videos.',
        intent: body.intent,
      };
    }

    if (body.provider === 'youtube') {
      if (!body.sourceId) {
        return { error: 'Playlist ID is required', intent: body.intent };
      }

      const [error, playlist] = await api.v2.get(
        '/youtube/playlists/{id}',
        { id: body.sourceId, $search: { roomType: room.roomType } },
        { signal },
      );

      if (error || !playlist) {
        return createErrorData(body.intent, error);
      }

      return { intent: body.intent, playlist };
    }

    if (!body.providerUrl) {
      return { error: 'SoundCloud URL is required', intent: body.intent };
    }

    const [error, playlist] = await api.v2.get(
      '/soundcloud/playlists',
      { $search: { url: body.providerUrl } },
      { signal },
    );
    if (!error && playlist) {
      return { intent: body.intent, playlist };
    }

    if (signal.aborted) return createErrorData(body.intent, error);

    const [itemError, item] = await api.v2.get(
      '/soundcloud/items',
      { $search: { url: body.providerUrl } },
      { signal },
    );

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
      { signal },
    );

    if (error || !searchResults) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, searchResults };
  }

  return { error: 'Unsupported playlist action', intent: body.intent };
}

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
