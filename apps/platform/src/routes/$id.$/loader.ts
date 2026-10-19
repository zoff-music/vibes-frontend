import { type LoaderFunctionArgs, redirect } from '@kasperrt/smolter/preact';
import { createProvidersRequest, getHttpError } from '@vibes/api';
import type {
  PlaylistItem,
  Providers,
  RoomV2 as RoomModel,
} from '@vibes/models';
import type { PlaybackStateV2 } from '@vibes/shared';
import { getServerApi } from '../../http.server';
import { roomPanel } from './utils/roomPanel';
import { createRoomPageUrl } from './utils/share';

export interface RoomLoaderData {
  room: RoomModel;
  playlistItems: PlaylistItem[];
  queuedPlaylistItemCount?: number;
  preloadPlaylistItems?: PlaylistItem[];
  playback?: PlaybackStateV2;
  providers: Providers;
  pageUrl: string;
}

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<RoomLoaderData | Response> {
  roomPanel(params['*']);
  const roomId = params.id;

  if (!roomId) {
    return redirect('/rooms/create');
  }

  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const options = { headers: requestHeaders, signal: request.signal };
  const getProviders = createProvidersRequest(serverApi);

  const [
    roomRes,
    playlistItemsRes,
    playbackRes,
    providersRes,
    youtubeRes,
    soundcloudRes,
  ] = await Promise.all([
    serverApi.v2.get('/rooms/{id}', { id: roomId }, options),
    serverApi.v3.get(
      '/rooms/{id}/items',
      { id: roomId, $search: { from: 1, to: 12, excludeCurrent: true } },
      options,
    ),
    serverApi.v2.get('/rooms/{id}/states', { id: roomId }, options),
    getProviders({ signal: request.signal }),
    serverApi.v3.get(
      '/rooms/{id}/items',
      { id: roomId, $search: { from: 1, to: 1, sourceType: 'youtube' } },
      options,
    ),
    serverApi.v3.get(
      '/rooms/{id}/items',
      { id: roomId, $search: { from: 1, to: 1, sourceType: 'soundcloud' } },
      options,
    ),
  ]);

  const [roomErr, room] = roomRes;
  const [playlistItemsErr, playlistPage] = playlistItemsRes;
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

  if (
    playlistItemsErr ||
    !playlistPage ||
    playbackErr ||
    providersErr ||
    youtubeRes[0] ||
    soundcloudRes[0]
  ) {
    throw new Response('Room temporarily unavailable', {
      status: 503,
      statusText: 'Room temporarily unavailable',
    });
  }

  return {
    pageUrl: createRoomPageUrl(request.url, roomId),
    room,
    playlistItems: playlistPage.data,
    preloadPlaylistItems: [
      ...(youtubeRes[1]?.data ?? []),
      ...(soundcloudRes[1]?.data ?? []),
    ],
    ...(playlistPage.total > playlistPage.count && {
      queuedPlaylistItemCount: playlistPage.total,
    }),
    playback: (playback || undefined) as PlaybackStateV2 | undefined,
    providers: (providers ?? []).filter(
      (provider) => room.roomType === 'MUSIC' || provider === 'youtube',
    ),
  };
}
