import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { type ApiClient, type ApiResult, createApiClient } from '@vibes/api';
import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  RoomV2,
} from '@vibes/models';

export interface CastCredentials {
  castToken: string | null;
  casterId: string | null;
  roomId: string | null;
}

export interface CastRoomSnapshot {
  playback: PlaybackStateV2;
  providers: Providers;
  room: RoomV2;
  playlistItems: PlaylistItem[];
}

export interface CastLoaderData {
  credentials: CastCredentials;
  error: string | null;
  snapshot: CastRoomSnapshot | null;
}

function getCredentials(request: Request): CastCredentials {
  const url = new URL(request.url);

  return {
    castToken: url.searchParams.get('castToken'),
    casterId:
      url.searchParams.get('casterId') ??
      url.searchParams.get('casterUserId') ??
      url.searchParams.get('sessionId'),
    roomId: url.searchParams.get('roomId'),
  };
}

async function loadSnapshot(
  client: ApiClient,
  roomId: string,
  request: Request,
): ApiResult<CastRoomSnapshot> {
  const [roomResult, playlistItemsResult, playbackResult, providersResult] =
    await Promise.all([
      client.v2.get('/rooms/{id}', { id: roomId }, { signal: request.signal }),
      client.v3.get(
        '/rooms/{id}/items',
        { id: roomId, $search: {} },
        { signal: request.signal },
      ),
      client.v2.get(
        '/rooms/{id}/states',
        { id: roomId },
        { signal: request.signal },
      ),
      client.get('/providers', null, { signal: request.signal }),
    ]);
  const [roomError, room] = roomResult;
  const [playlistItemsError, playlistItems] = playlistItemsResult;
  const [playbackError, playback] = playbackResult;
  const [providersError, providers] = providersResult;
  const requestError =
    roomError ?? playlistItemsError ?? playbackError ?? providersError;

  if (requestError) return [requestError, null];

  if (!room || !playlistItems || !playback || !providers) {
    return [new Error('Cast room snapshot was incomplete.'), null];
  }

  const enabledProviders = providers.filter((provider) =>
    room.settings.enabledSources.includes(provider),
  );

  return [
    null,
    {
      playback,
      providers: enabledProviders,
      room,
      playlistItems: playlistItems.data,
    },
  ];
}

export async function clientLoader({
  request,
}: ClientLoaderFunctionArgs): Promise<CastLoaderData> {
  const credentials = getCredentials(request);

  if (!credentials.roomId || !credentials.castToken) {
    return { credentials, error: null, snapshot: null };
  }

  const client = createApiClient({
    Authorization: `Bearer ${credentials.castToken}`,
  });
  const [requestError, snapshot] = await loadSnapshot(
    client,
    credentials.roomId,
    request,
  );

  if (requestError || !snapshot) {
    return {
      credentials,
      error: 'Could not connect to this room. Reconnect and try again.',
      snapshot: null,
    };
  }

  return { credentials, error: null, snapshot };
}
