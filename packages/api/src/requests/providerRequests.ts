import type {
  AddPlaylistRequest,
  AddPlaylistResponse,
  AddSongRequest,
  AddSongResponse,
  MusicPlaylist,
  SearchResult,
  SourceType,
} from '@vibes/models';
import type { ApiClient, ApiResult } from '../index';

export function createProviderSearchRequest(client: ApiClient) {
  return async (
    provider: SourceType,
    query: string,
  ): ApiResult<SearchResult[]> => {
    if (provider === 'youtube') {
      const [error, videos] = await client.get('/youtube/search', {
        $search: { q: query },
      });
      if (error) return [error, null];
      return [
        null,
        (videos ?? []).map((video) => ({
          ...video,
          source: 'youtube' as const,
        })),
      ];
    }
    if (provider === 'spotify') {
      return client.get('/spotify/search', { $search: { q: query } });
    }
    return client.get('/soundcloud/search', { $search: { q: query } });
  };
}

export function createProviderTrackRequest(client: ApiClient) {
  return async (
    provider: SourceType,
    source: string,
  ): ApiResult<SearchResult> => {
    if (provider === 'youtube') {
      const [error, video] = await client.get('/youtube/videos/{id}', {
        id: source,
      });
      if (error) return [error, null];
      return [null, { ...video, source: 'youtube' }];
    }
    if (provider === 'spotify') {
      return client.get('/spotify/tracks/{id}', { id: source });
    }
    return client.get('/soundcloud/tracks', { $search: { url: source } });
  };
}

export function createProviderPlaylistRequest(client: ApiClient) {
  return (provider: SourceType, source: string): ApiResult<MusicPlaylist> => {
    if (provider === 'youtube') {
      return client.get('/youtube/playlists/{id}', { id: source });
    }
    if (provider === 'spotify') {
      return client.get('/spotify/playlists/{id}', { id: source });
    }
    return client.get('/soundcloud/playlists', {
      $search: { url: source },
    });
  };
}

export interface QueueAddRequests {
  addPlaylist: (
    roomId: string,
    playlist: AddPlaylistRequest,
  ) => ApiResult<AddPlaylistResponse>;
  addSong: (roomId: string, song: AddSongRequest) => ApiResult<AddSongResponse>;
}

export function createQueueAddRequests(client: ApiClient): QueueAddRequests {
  return {
    addPlaylist: (roomId: string, playlist: AddPlaylistRequest) =>
      client.post('/rooms/{id}/playlists', { id: roomId }, playlist),
    addSong: (roomId: string, song: AddSongRequest) =>
      client.post('/rooms/{id}/songs', { id: roomId }, song),
  };
}
