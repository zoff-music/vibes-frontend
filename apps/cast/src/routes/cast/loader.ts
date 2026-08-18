import { type ApiClient, type ApiResult, createApiClient } from '@vibes/api';
import type { PlaybackState, Providers, Room, Song } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';

export interface CastCredentials {
  castToken: string | null;
  casterId: string | null;
  roomId: string | null;
}

export interface CastRoomSnapshot {
  playback: PlaybackState;
  providers: Providers;
  room: Room;
  songs: Song[];
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
): ApiResult<CastRoomSnapshot> {
  const [roomResult, songsResult, playbackResult, providersResult] =
    await Promise.all([
      client.get('/rooms/{id}', { id: roomId }),
      client.get('/rooms/{id}/songs', { id: roomId }),
      client.get('/rooms/{id}/states', { id: roomId }),
      client.get('/providers', null),
    ]);
  const [roomError, room] = roomResult;
  const [songsError, songs] = songsResult;
  const [playbackError, playback] = playbackResult;
  const [providersError, providers] = providersResult;
  const requestError =
    roomError ?? songsError ?? playbackError ?? providersError;
  if (requestError) return [requestError, null];
  if (!room || !songs || !playback || !providers) {
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
      songs,
    },
  ];
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<CastLoaderData> {
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
