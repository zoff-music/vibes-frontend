import { type ApiClient, type ApiResult, createApiClient } from '@vibes/api';
import type {
  EmptyObject,
  PlaybackState,
  Providers,
  Room,
  Song,
} from '@vibes/models';

export interface CastRoomSnapshot {
  playback: PlaybackState;
  providers: Providers;
  room: Room;
  songs: Song[];
  spotifyAccessToken: string | null;
  spotifyTokenUnavailable: boolean;
}

export function createCastApiClient(castToken: string): ApiClient {
  return createApiClient({ Authorization: `Bearer ${castToken}` });
}

export async function loadCastRoomSnapshot(
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
  if (!enabledProviders.includes('spotify')) {
    return [
      null,
      {
        playback,
        providers: enabledProviders,
        room,
        songs,
        spotifyAccessToken: null,
        spotifyTokenUnavailable: false,
      },
    ];
  }

  const [tokenError, token] = await client.get('/tokens/{provider}', {
    provider: 'spotify',
  });
  return [
    null,
    {
      playback,
      providers: enabledProviders,
      room,
      songs,
      spotifyAccessToken: token?.accessToken ?? null,
      spotifyTokenUnavailable: Boolean(tokenError || !token),
    },
  ];
}

export function reportCastPlaybackFailure(
  client: ApiClient,
  roomId: string,
  songId: string,
): ApiResult<EmptyObject> {
  return client.post(
    '/rooms/{id}/playbackfailures',
    { id: roomId },
    { songId },
  );
}
