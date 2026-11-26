import type {
  AddPlaylistItemRequest,
  AddPlaylistItemResponse,
  AddPlaylistRequestV2,
  AddPlaylistResponse,
  ProviderItem,
  ProviderPlaylist,
  Providers,
  RoomType,
  SourceType,
} from '@vibes/models';

import {
  API_BASE_URL,
  type ApiClient,
  type ApiRequestOptions,
  type ApiResult,
  api,
} from '../client';
import { createPublicRequestCache } from './cache';

export function createProvidersRequest(client: ApiClient) {
  // Wiretyped owns the cache. This only isolates cancellation between readers.
  const read = createPublicRequestCache<Providers>(0);

  return (options?: ApiRequestOptions): ApiResult<Providers> =>
    read(
      'providers',
      () =>
        client.get('/providers', null, {
          retry: 0,
          cacheRequest: true,
          cacheTimeToLive: 5 * 60_000,
        }),
      options?.signal,
    );
}

export const getProviders = /* @__PURE__ */ createProvidersRequest(api);

export function createProviderSearchRequest(client: ApiClient) {
  return (
    roomId: string,
    provider: SourceType,
    query: string,
    options?: ApiRequestOptions,
  ): ApiResult<ProviderItem[]> =>
    client.v2.get(
      '/rooms/{id}/search/{provider}',
      {
        id: roomId,
        provider,
        $search: { q: query.trim().replace(/\s+/g, ' ') },
      },
      { ...options, cacheRequest: false, retry: 0 },
    );
}

export const searchProvider = /* @__PURE__ */ createProviderSearchRequest(api);

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

export function playlistAuthorizationUrl(
  provider: SourceType,
  source: string,
  flow: { channel: string } | { challenge: string },
  baseUrl = API_BASE_URL,
) {
  const url = new URL(`${baseUrl}/authorizations/${provider}`);
  url.searchParams.set('playlist', source);
  if ('channel' in flow) {
    url.searchParams.set('flow', 'web');
    url.searchParams.set('channel', flow.channel);
  } else {
    url.searchParams.set('flow', 'native');
    url.searchParams.set('challenge', flow.challenge);
  }
  return url.toString();
}

export function createProviderPlaylistRequest(client: ApiClient) {
  return (
    provider: SourceType,
    source: string,
    roomType: RoomType,
    options?: ApiRequestOptions & { playlistAuthorization?: string },
  ): ApiResult<ProviderPlaylist> => {
    const request = {
      signal: options?.signal,
      timeout: 120_000,
      ...(options?.playlistAuthorization && {
        headers: { 'X-Playlist-Authorization': options.playlistAuthorization },
        retry: 0,
        cacheRequest: false,
      }),
    };
    if (provider === 'youtube') {
      return client.v2.get(
        '/youtube/playlists/{id}',
        { id: source, $search: { roomType } },
        request,
      );
    }

    return client.v2.get(
      '/soundcloud/playlists',
      {
        $search: { url: source },
      },
      request,
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
      client.v3.post(
        '/rooms/{id}/items',
        { id: roomId },
        playlistItem,
        options,
      ),
  };
}
