import type { ApiClient } from '@vibes/api';
import type { PlaybackState, RemoteStatus, Room, Song } from '@vibes/models';

export interface ControllerLoaderData {
  error?: string;
  playback?: PlaybackState;
  providers: string[];
  remote?: RemoteStatus;
  room?: Room;
  songs: Song[];
}

export async function loadController(
  client: ApiClient,
  remoteId: string,
  headers?: Record<string, string>,
): Promise<ControllerLoaderData> {
  if (!remoteId) {
    return { error: 'Remote ID is required.', providers: [], songs: [] };
  }

  const [remoteError, remote] = await client.get(
    '/remotes/{id}',
    { id: remoteId },
    { headers },
  );
  if (remoteError || !remote) {
    return {
      error: 'This remote is not paired, disabled, or its machine is offline.',
      providers: [],
      songs: [],
    };
  }
  if (!remote.currentRoomId) {
    return { providers: [], remote, songs: [] };
  }

  const roomId = remote.currentRoomId;
  const [roomResult, songResult, playbackResult, providerResult] =
    await Promise.all([
      client.get('/rooms/{id}', { id: roomId }, { headers }),
      client.get('/rooms/{id}/songs', { id: roomId }, { headers }),
      client.get('/rooms/{id}/states', { id: roomId }, { headers }),
      client.get('/providers', null, { headers }),
    ]);
  const [roomError, room] = roomResult;
  const [, songs] = songResult;
  const [, playback] = playbackResult;
  const [, providers] = providerResult;
  if (roomError || !room) {
    return {
      error: 'The controlled machine is in a room that is no longer available.',
      providers: providers ?? [],
      remote,
      songs: [],
    };
  }

  return {
    playback: playback ?? undefined,
    providers: providers ?? [],
    remote,
    room,
    songs: songs ?? [],
  };
}
