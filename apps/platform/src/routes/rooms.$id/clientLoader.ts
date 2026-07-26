import { api } from '@vibes/api';
import type { PlaybackState } from '@vibes/shared';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import type { RoomLoaderData } from './loader';

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
  const [, songs] = songsRes;
  const [, playback] = playbackRes;
  const [, providers] = providersRes;
  if (roomErr || !room) {
    const createUrl = new URL('/rooms/create', request.url);
    createUrl.searchParams.set('name', roomId);
    return redirect(createUrl.toString());
  }

  return {
    playback: (playback || undefined) as PlaybackState | undefined,
    providers: providers ?? [],
    room,
    songs: songs || [],
  };
}
