import { type LoaderFunctionArgs, redirect } from '@kasperrt/smolter/preact';
import {
  createProvidersRequest,
  getHttpError,
  getRateLimitResponse,
} from '@vibes/api';
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

  const [roomRes, playlistItemsRes, playbackRes, providersRes] =
    await Promise.all([
      serverApi.v2.get('/rooms/{id}', { id: roomId }, options),
      serverApi.v3.get(
        '/rooms/{id}/items',
        { id: roomId, $search: { from: 1, to: 12, excludeCurrent: true } },
        options,
      ),
      serverApi.v2.get('/rooms/{id}/states', { id: roomId }, options),
      getProviders({ signal: request.signal }),
    ]);

  const [roomErr, room] = roomRes;
  const [playlistItemsErr, playlistPage] = playlistItemsRes;
  const [playbackErr, playback] = playbackRes;
  const [providersErr, providers] = providersRes;

  const rateLimitResponse = getRateLimitResponse([
    roomErr,
    playlistItemsErr,
    playbackErr,
    providersErr,
  ]);
  if (rateLimitResponse) throw rateLimitResponse;

  if (roomErr || !room) {
    const status = roomErr ? getHttpError(roomErr)?.response.status : null;

    if (status !== 404) {
      throw new Response('Room temporarily unavailable', {
        status: 503,
        statusText: 'Room temporarily unavailable',
      });
    }

    const [resolutionError, resolvedRoom] = await serverApi.v2.get(
      '/room-resolutions',
      { $search: { name: roomId } },
      options,
    );
    const resolutionRateLimit = getRateLimitResponse([resolutionError]);
    if (resolutionRateLimit) throw resolutionRateLimit;
    if (resolvedRoom) {
      const canonicalUrl = new URL(request.url);
      canonicalUrl.pathname = `/${encodeURIComponent(resolvedRoom.id)}`;
      return redirect(canonicalUrl.toString());
    }
    if (
      resolutionError &&
      getHttpError(resolutionError)?.response.status !== 404
    ) {
      throw new Response('Room temporarily unavailable', { status: 503 });
    }

    const createUrl = new URL('/rooms/create', request.url);
    createUrl.searchParams.set('name', roomId);

    if (new URL(request.url).searchParams.get('type') === 'watch') {
      createUrl.searchParams.set('type', 'watch');
    }

    return redirect(createUrl.toString());
  }

  if (playlistItemsErr || !playlistPage || playbackErr || providersErr) {
    throw new Response('Room temporarily unavailable', {
      status: 503,
      statusText: 'Room temporarily unavailable',
    });
  }

  return {
    pageUrl: createRoomPageUrl(request.url, roomId),
    room,
    playlistItems: playlistPage.data,
    ...(playlistPage.total > playlistPage.count && {
      queuedPlaylistItemCount: playlistPage.total,
    }),
    playback: (playback || undefined) as PlaybackStateV2 | undefined,
    providers: (providers ?? []).filter(
      (provider) => room.roomType === 'MUSIC' || provider === 'youtube',
    ),
  };
}
