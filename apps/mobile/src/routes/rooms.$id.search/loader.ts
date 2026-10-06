import {
  createProviderItemRequest,
  createProviderPlaylistRequest,
  createProviderSearchRequest,
  createRoomReadRequests,
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
  const roomId = params.id ?? params.roomId ?? '';
  const [roomError, room] = await createRoomReadRequests(client).fetchRoom(
    roomId,
    { signal },
  );

  if (roomError || !room) {
    return failure(roomError, 'Could not load this room.');
  }

  const playlistLink = parseProviderPlaylistLink(query);
  const itemLink = parseProviderItemLink(query);
  const requestedProvider =
    playlistLink?.provider ?? itemLink?.provider ?? provider;

  if (room.roomType === 'WATCH' && requestedProvider !== 'youtube') {
    return { data: null, error: 'Watch rooms support YouTube only.' };
  }

  if (!room.settings.enabledSources.includes(requestedProvider)) {
    return { data: null, error: 'This provider is disabled in this room.' };
  }

  if (playlistLink) {
    if (!isMobileProvider(playlistLink.provider)) {
      return { data: null, error: 'This provider is not available on mobile.' };
    }
    const source = playlistLink.sourceId ?? playlistLink.providerUrl ?? '';
    const [error, playlist] = await createProviderPlaylistRequest(client)(
      playlistLink.provider,
      source,
      room.roomType,
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
    if (error || !item) return failure(error, 'Could not load this item.');
    return {
      data: { playlist: null, provider: itemLink.provider, results: [item] },
      error: '',
    };
  }
  const [error, results] = await createProviderSearchRequest(client)(
    roomId,
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
