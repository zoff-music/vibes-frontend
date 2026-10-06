import { api, getHttpError } from '@vibes/api';
import type { PlaybackStateV2 } from '@vibes/shared';
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

  const [roomRes, playlistItemsRes, playbackRes, providersRes] =
    await Promise.all([
      api.v2.get('/rooms/{id}', { id: roomId }),
      api.v2.get('/rooms/{id}/playlist-items', { id: roomId }),
      api.v2.get('/rooms/{id}/states', { id: roomId }),
      api.get('/providers', null),
    ]);
  const [roomErr, room] = roomRes;
  const [playlistItemsErr, playlistItems] = playlistItemsRes;
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
    if (new URL(request.url).searchParams.get('type') === 'watch') {
      createUrl.searchParams.set('type', 'watch');
    }
    return redirect(createUrl.toString());
  }
  if (playlistItemsErr || playbackErr || providersErr) {
    throw new Response('Room temporarily unavailable', {
      status: 503,
      statusText: 'Room temporarily unavailable',
    });
  }

  return {
    pageUrl: createRoomPageUrl(request.url, roomId),
    playback: (playback || undefined) as PlaybackStateV2 | undefined,
    providers: (providers ?? []).filter(
      (provider) => room.roomType === 'MUSIC' || provider === 'youtube',
    ),
    room,
    playlistItems: playlistItems || [],
  };
}
