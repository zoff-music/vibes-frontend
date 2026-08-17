import { api, getHttpError } from '@vibes/api';
import type { PlaybackState } from '@vibes/shared';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import type { RoomLoaderData } from './loader';
import { createRoomPageUrl } from './share';

export async function clientLoader({
  request,
  params,
}: ClientLoaderFunctionArgs): Promise<RoomLoaderData | Response> {
  const roomId = params.id;
  if (!roomId) {
    return redirect('/rooms/create');
  }

  const [roomRes, songsRes, playbackRes, providersRes] = await Promise.all([
    api.get('/rooms/{id}', { id: roomId }),
    api.get('/rooms/{id}/songs', { id: roomId }),
    api.get('/rooms/{id}/states', { id: roomId }),
    api.get('/providers', null),
  ]);
  const [roomErr, room] = roomRes;
  const [songsErr, songs] = songsRes;
  const [playbackErr, playback] = playbackRes;
  const [providersErr, providers] = providersRes;
  if (roomErr || !room) {
    const status = roomErr ? getHttpError(roomErr)?.response.status : null;
    if (status !== 404) {
      throw new Response('Room temporarily unavailable', {
        status: status === 429 ? 429 : 503,
        statusText: 'Room temporarily unavailable',
      });
    }
    const createUrl = new URL('/rooms/create', request.url);
    createUrl.searchParams.set('name', roomId);
    return redirect(createUrl.toString());
  }
  if (songsErr || playbackErr || providersErr) {
    throw new Response('Room temporarily unavailable', {
      status: 503,
      statusText: 'Room temporarily unavailable',
    });
  }

  return {
    pageUrl: createRoomPageUrl(request.url, roomId),
    playback: (playback || undefined) as PlaybackState | undefined,
    providers: providers ?? [],
    room,
    songs: songs || [],
  };
}
