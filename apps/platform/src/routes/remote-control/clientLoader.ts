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
        enabled: false,
        id: '',
        online: false,
      },
    };
  }

  return { remote };
}
