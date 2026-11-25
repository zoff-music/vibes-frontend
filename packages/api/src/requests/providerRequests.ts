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
  // Results contain public provider metadata; scope reuse to this client and room.
  const read = createPublicRequestCache<ProviderItem[]>(5 * 60_000);

  return async (
    roomId: string,
    provider: SourceType,
    query: string,
    options?: ApiRequestOptions,
  ): ApiResult<ProviderItem[]> => {
    const normalizedQuery = query.trim().replace(/\s+/g, ' ');
    const key = JSON.stringify([roomId, provider, normalizedQuery]);

    return read(
      key,
      (signal) =>
        client.v2.get(
          '/rooms/{id}/search/{provider}',
          { id: roomId, provider, $search: { q: normalizedQuery } },
          { ...options, signal, retry: 0 },
        ),
      options?.signal,
    );
  };
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
  baseUrl = API_BASE_URL,
  channel?: string,
) {
  const url = new URL(`${baseUrl}/authorizations/${provider}`);
  url.searchParams.set('playlist', source);
  if (channel) url.searchParams.set('channel', channel);
  return url.toString();
}

export function createProviderPlaylistRequest(client: ApiClient) {
  return (
    provider: SourceType,
    source: string,
    roomType: RoomType,
    options?: ApiRequestOptions & { importCode?: string },
  ): ApiResult<ProviderPlaylist> => {
    const request = {
      signal: options?.signal,
      timeout: 120_000,
      ...(options?.importCode && {
        headers: { 'X-Playlist-Code': options.importCode },
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
