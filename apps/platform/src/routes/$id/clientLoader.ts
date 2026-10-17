import {
  type ClientLoaderFunctionArgs,
  redirect,
} from '@kasperrt/smolter/preact';
import { api, getHttpError, getProviders } from '@vibes/api';
import type { PlaybackStateV2 } from '@vibes/shared';
import type { RoomLoaderData } from './loader';
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

  const options = { signal: request.signal };
  // Reconnects still recover the full queue, including missed removal events.
  const isRevalidation = reason === 'revalidation' || reason === 'action';

  const [
    roomRes,
    playlistItemsRes,
    playbackRes,
    providersRes,
    youtubeRes,
    soundcloudRes,
  ] = await Promise.all([
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
    api.v3.get(
      '/rooms/{id}/items',
      {
        id: roomId,
        $search: { from: 1, to: 1, sourceType: 'youtube' },
      },
      options,
    ),
    api.v3.get(
      '/rooms/{id}/items',
      {
        id: roomId,
        $search: { from: 1, to: 1, sourceType: 'soundcloud' },
      },
      options,
    ),
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

  if (
    playlistItemsErr ||
    !playlistItems ||
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
    playback: (playback || undefined) as PlaybackStateV2 | undefined,
    providers: (providers ?? []).filter(
      (provider) => room.roomType === 'MUSIC' || provider === 'youtube',
    ),
    room,
    playlistItems: playlistItems?.data ?? [],
    preloadPlaylistItems: [
      ...(youtubeRes[1]?.data ?? []),
      ...(soundcloudRes[1]?.data ?? []),
    ],
    ...(!isRevalidation &&
      playlistItems.total > playlistItems.count && {
        queuedPlaylistItemCount: playlistItems.total,
      }),
  };
}
