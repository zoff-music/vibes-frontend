import {
  createProviderPlaylistRequest,
  createProviderSearchRequest,
  createProviderTrackRequest,
} from '@vibes/api';
import type { MusicPlaylist, SearchResult, SourceType } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import {
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';

export interface SearchData {
  playlist: MusicPlaylist | null;
  provider: SourceType;
  results: SearchResult[];
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
        results: playlist.tracks,
      },
      error: '',
    };
  }
  const trackLink = parseProviderTrackLink(query);
  if (trackLink) {
    const source = trackLink.sourceId ?? trackLink.providerUrl ?? '';
    const [error, track] = await createProviderTrackRequest(client)(
      trackLink.provider,
      source,
      { signal },
    );
    if (error || !track) return failure(error, 'Could not load this song.');
    return {
      data: { playlist: null, provider: trackLink.provider, results: [track] },
      error: '',
    };
  }
  const [error, results] = await createProviderSearchRequest(client)(
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
  if (value === 'spotify' || value === 'soundcloud') return value;
  return 'youtube';
}
