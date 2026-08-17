import { api, getHttpError } from '@vibes/api';
import { parseColorScheme, safeWrap } from '@vibes/shared';
import type { ClientLoaderFunctionArgs } from 'react-router';
import type { EmbedLoaderData } from './loader';

export async function embedRoomClientLoader({
  params,
  request,
}: ClientLoaderFunctionArgs): Promise<EmbedLoaderData> {
  const requestUrl = new URL(request.url);
  const encodedRoomId = params['*']?.split('/').at(-1);
  const [decodeError, roomId] = safeWrap(() =>
    decodeURIComponent(encodedRoomId ?? ''),
  );
  if (!encodedRoomId || encodedRoomId.includes('/') || decodeError || !roomId) {
    throw new Response('Room not found', { status: 404 });
  }

  const [roomResult, songsResult, playbackResult, providersResult] =
    await Promise.all([
      api.get('/rooms/{id}', { id: roomId }),
      api.get('/rooms/{id}/songs', { id: roomId }),
      api.get('/rooms/{id}/states', { id: roomId }),
      api.get('/providers', null),
    ]);
  const [roomError, room] = roomResult;
  const [songsError, songs] = songsResult;
  const [playbackError, playback] = playbackResult;
  const [providersError, providers] = providersResult;
  if (roomError || songsError || playbackError || providersError || !room) {
    const roomStatus = roomError
      ? getHttpError(roomError)?.response.status
      : null;
    if (roomStatus === 404) {
      throw new Response('Room not found', { status: 404 });
    }
    throw new Response('Embedded room temporarily unavailable', {
      status: 503,
      statusText: 'Embedded room temporarily unavailable',
    });
  }

  return {
    options: {
      player: requestUrl.searchParams.get('player') !== 'false',
      playlist: requestUrl.searchParams.get('playlist') !== 'false',
      skip: requestUrl.searchParams.get('skip') !== 'false',
      vote: requestUrl.searchParams.get('vote') !== 'false',
      theme: parseColorScheme(requestUrl.searchParams.get('theme')),
    },
    playback: playback ?? undefined,
    providers: providers ?? [],
    room,
    roomId,
    songs: songs ?? [],
  };
}
