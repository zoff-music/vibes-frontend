import {
  type ClientLoaderFunctionArgs,
  redirect,
} from '@kasperrt/smolter/preact';
import {
  api,
  getHttpError,
  getProviders,
  getRateLimitResponse,
} from '@vibes/api';
import type { PlaybackStateV2 } from '@vibes/shared';
import type { RoomLoaderData } from './loader';
import {
  getRetainedRoomData,
  loadRoomPanel,
  roomPanel,
} from './utils/roomPanel';
import { createRoomPageUrl } from './utils/share';

export async function clientLoader({
  request,
  params,
  reason,
}: ClientLoaderFunctionArgs): Promise<RoomLoaderData | Response> {
  const roomId = params.id;

  if (!roomId) {
    return redirect('/rooms/create');
  }

  // Load the root-owned session through the route's normal failure/recovery
  // boundary before committing navigation.
  await import('./components/RoomView');
  await loadRoomPanel(roomPanel(params['*']));
  const retained = getRetainedRoomData(roomId);

  if (retained && (reason === 'navigation' || reason === 'prefetch'))
    return retained;

  const options = { signal: request.signal };
  // Reconnects still recover the full queue, including missed removal events.
  const isRevalidation = reason === 'revalidation' || reason === 'action';

  const [roomRes, playlistItemsRes, playbackRes, providersRes] =
    await Promise.all([
      api.v2.get('/rooms/{id}', { id: roomId }, options),
      api.v3.get(
        '/rooms/{id}/items',
        {
          id: roomId,
          $search: isRevalidation
            ? {}
            : { from: 1, to: 12, excludeCurrent: true },
        },
        options,
      ),
      api.v2.get('/rooms/{id}/states', { id: roomId }, options),
      getProviders(options),
    ]);
  const [roomErr, room] = roomRes;
  const [playlistItemsErr, playlistItems] = playlistItemsRes;
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

    const [resolutionError, resolvedRoom] = await api.v2.get(
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

  if (playlistItemsErr || !playlistItems || playbackErr || providersErr) {
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
    playlistItems: playlistItems?.data ?? [],
    ...(!isRevalidation &&
      playlistItems.total > playlistItems.count && {
        queuedPlaylistItemCount: playlistItems.total,
      }),
  };
}
