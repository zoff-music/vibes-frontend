import type {
  AddPlaylistItemRequest,
  AddPlaylistItemResponse,
  AddPlaylistRequestV2,
  AddPlaylistResponse,
  ProviderItem,
  ProviderPlaylist,
  SourceType,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export function createProviderSearchRequest(client: ApiClient) {
  return async (
    roomId: string,
    provider: SourceType,
    query: string,
    options?: ApiRequestOptions,
  ): ApiResult<ProviderItem[]> => {
    return client.v2.get(
      '/rooms/{id}/search/{provider}',
      { id: roomId, provider, $search: { q: query } },
      options,
    );
  };
}

export function createProviderItemRequest(client: ApiClient) {
  return async (
    provider: SourceType,
    source: string,
    options?: ApiRequestOptions,
  ): ApiResult<ProviderItem> => {
    if (provider === 'youtube') {
      return client.v2.get('/youtube/videos/{id}', { id: source }, options);
    }
    return client.v2.get(
      '/soundcloud/items',
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
  ): ApiResult<ProviderPlaylist> => {
    if (provider === 'youtube') {
      return client.v2.get('/youtube/playlists/{id}', { id: source }, options);
    }
    return client.v2.get(
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
    playlist: AddPlaylistRequestV2,
    options?: ApiRequestOptions,
  ) => ApiResult<AddPlaylistResponse>;
  addPlaylistItem: (
    roomId: string,
    playlistItem: AddPlaylistItemRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<AddPlaylistItemResponse>;
}

export function createQueueAddRequests(client: ApiClient): QueueAddRequests {
  return {
    addPlaylist: (
      roomId: string,
      playlist: AddPlaylistRequestV2,
      options?: ApiRequestOptions,
    ) =>
      client.v2.post(
        '/rooms/{id}/playlists',
        { id: roomId },
        playlist,
        options,
      ),
    addPlaylistItem: (
      roomId: string,
      playlistItem: AddPlaylistItemRequest,
      options?: ApiRequestOptions,
    ) =>
      client.v2.post(
        '/rooms/{id}/playlist-items',
        { id: roomId },
        playlistItem,
        options,
      ),
  };
}
