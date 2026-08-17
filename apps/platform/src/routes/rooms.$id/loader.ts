import { getHttpError } from '@vibes/api';
import type { Providers, Room as RoomModel, Song } from '@vibes/models';
import type { PlaybackState } from '@vibes/shared';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { getServerApi } from '../../http.server';
import { createRoomPageUrl } from './share';

export interface RoomLoaderData {
  room: RoomModel;
  songs: Song[];
  playback?: PlaybackState;
  providers: Providers;
  pageUrl: string;
}

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<RoomLoaderData | Response> {
  const roomId = params.id;
  if (!roomId) {
    return redirect('/rooms/create');
  }

  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const [roomRes, songsRes, playbackRes, providersRes] = await Promise.all([
    serverApi.get('/rooms/{id}', { id: roomId }, { headers: requestHeaders }),
    serverApi.get(
      '/rooms/{id}/songs',
      { id: roomId },
      { headers: requestHeaders },
    ),
    serverApi.get(
      '/rooms/{id}/states',
      { id: roomId },
      { headers: requestHeaders },
    ),
    serverApi.get('/providers', null, { headers: requestHeaders }),
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
    room,
    songs: songs || [],
    playback: (playback || undefined) as PlaybackState | undefined,
    providers: providers ?? [],
  };
}
