import { api } from '@vibes/api';
import type { RemoteStatus } from '@vibes/models';

export interface RemoteControlLoaderData {
  remote: RemoteStatus;
}

export async function clientLoader(): Promise<RemoteControlLoaderData> {
  const [error, remote] = await api.get('/remotes', null);
  if (error || !remote) {
    return {
      remote: {
        currentRoomId: '',
        currentSongId: '',
        enabled: false,
        id: '',
        online: false,
        paired: false,
        playbackIsPlaying: false,
        playbackObservedAt: '',
        playbackPositionMs: 0,
      },
    };
  }

  return { remote };
}
