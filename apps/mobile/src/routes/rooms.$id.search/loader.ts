import {
  createProviderItemRequest,
  createProviderPlaylistRequest,
  createProviderSearchRequest,
} from '@vibes/api';
import type { ProviderItem, ProviderPlaylist, SourceType } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import {
  parseProviderItemLink,
  parseProviderPlaylistLink,
} from '@vibes/shared';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';
import { isMobileProvider } from '@/lib/mobile-content';

export interface SearchData {
  playlist: ProviderPlaylist | null;
  provider: SourceType;
  results: ProviderItem[];
}

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<SearchData>> {
  const provider = getProvider(params.provider);
  const query = params.query?.trim() ?? '';
  const client =
    params.remoteId && params.controllerToken
      ? createRemoteApi(params.remoteId, params.controllerToken)
      : mobileApi;
  const playlistLink = parseProviderPlaylistLink(query);
  if (playlistLink) {
    if (!isMobileProvider(playlistLink.provider)) {
      return { data: null, error: 'This provider is not available on mobile.' };
    }
    const source = playlistLink.sourceId ?? playlistLink.providerUrl ?? '';
    const [error, playlist] = await createProviderPlaylistRequest(client)(
      playlistLink.provider,
      source,
      { signal },
    );
    if (error || !playlist) {
      return failure(error, 'Could not load this playlist.');
    }
    return {
      data: {
        playlist,
        provider: playlistLink.provider,
        results: playlist.items,
      },
      error: '',
    };
  }
  const itemLink = parseProviderItemLink(query);
  if (itemLink) {
    if (!isMobileProvider(itemLink.provider)) {
      return { data: null, error: 'This provider is not available on mobile.' };
    }
    const source = itemLink.sourceId ?? itemLink.providerUrl ?? '';
    const [error, item] = await createProviderItemRequest(client)(
      itemLink.provider,
      source,
      { signal },
    );
    if (error || !item) return failure(error, 'Could not load this song.');
    return {
      data: { playlist: null, provider: itemLink.provider, results: [item] },
      error: '',
    };
  }
  const [error, results] = await createProviderSearchRequest(client)(
    params.id ?? params.roomId ?? '',
    provider,
    query,
    { signal },
  );
  if (error || !results) {
    return failure(error, `Could not search ${provider}. Try again.`);
  }
  return { data: { playlist: null, provider, results }, error: '' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<SearchData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function getProvider(value: string | undefined): SourceType {
  if (value === 'soundcloud') return value;
  return 'youtube';
}
