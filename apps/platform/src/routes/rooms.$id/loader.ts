import { getHttpError } from '@vibes/api';
import type {
  PlaylistItem,
  Providers,
  RoomV2 as RoomModel,
} from '@vibes/models';
import type { PlaybackStateV2 } from '@vibes/shared';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { getServerApi } from '../../http.server';
import { createRoomPageUrl } from './share';

export interface RoomLoaderData {
  room: RoomModel;
  playlistItems: PlaylistItem[];
  playback?: PlaybackStateV2;
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

  const [roomRes, playlistItemsRes, playbackRes, providersRes] =
    await Promise.all([
      serverApi.v2.get(
        '/rooms/{id}',
        { id: roomId },
        { headers: requestHeaders },
      ),
      serverApi.v2.get(
        '/rooms/{id}/playlist-items',
        { id: roomId },
        { headers: requestHeaders },
      ),
      serverApi.v2.get(
        '/rooms/{id}/states',
        { id: roomId },
        { headers: requestHeaders },
      ),
      serverApi.get('/providers', null, { headers: requestHeaders }),
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
    room,
    playlistItems: playlistItems || [],
    playback: (playback || undefined) as PlaybackStateV2 | undefined,
    providers: providers ?? [],
  };
}
