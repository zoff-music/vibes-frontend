import type {
  AddPlaylistRequest,
  AddPlaylistResponse,
  AddSongRequest,
  AddSongResponse,
  MusicPlaylist,
  SearchResult,
  SourceType,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export function createProviderSearchRequest(client: ApiClient) {
  return async (
    provider: SourceType,
    query: string,
    options?: ApiRequestOptions,
  ): ApiResult<SearchResult[]> => {
    if (provider === 'youtube') {
      const [error, videos] = await client.get(
        '/youtube/search',
        { $search: { q: query } },
        options,
      );
      if (error) return [error, null];
      return [
        null,
        (videos ?? []).map((video) => ({
          ...video,
          source: 'youtube' as const,
        })),
      ];
    }
    return client.get('/soundcloud/search', { $search: { q: query } }, options);
  };
}

export function createProviderTrackRequest(client: ApiClient) {
  return async (
    provider: SourceType,
    source: string,
    options?: ApiRequestOptions,
  ): ApiResult<SearchResult> => {
    if (provider === 'youtube') {
      const [error, video] = await client.get(
        '/youtube/videos/{id}',
        { id: source },
        options,
      );
      if (error) return [error, null];
      return [null, { ...video, source: 'youtube' }];
    }
    return client.get(
      '/soundcloud/tracks',
      { $search: { url: source } },
      options,
    );
  };
}

export function createProviderPlaylistRequest(client: ApiClient) {
  return (
    provider: SourceType,
    source: string,
    options?: ApiRequestOptions,
  ): ApiResult<MusicPlaylist> => {
    if (provider === 'youtube') {
      return client.get('/youtube/playlists/{id}', { id: source }, options);
    }
    return client.get(
      '/soundcloud/playlists',
      {
        $search: { url: source },
      },
      options,
    );
  };
}

export interface QueueAddRequests {
  addPlaylist: (
    roomId: string,
    playlist: AddPlaylistRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<AddPlaylistResponse>;
  addSong: (
    roomId: string,
    song: AddSongRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<AddSongResponse>;
}

export function createQueueAddRequests(client: ApiClient): QueueAddRequests {
  return {
    addPlaylist: (
      roomId: string,
      playlist: AddPlaylistRequest,
      options?: ApiRequestOptions,
    ) =>
      client.post('/rooms/{id}/playlists', { id: roomId }, playlist, options),
    addSong: (
      roomId: string,
      song: AddSongRequest,
      options?: ApiRequestOptions,
    ) => client.post('/rooms/{id}/songs', { id: roomId }, song, options),
  };
}
