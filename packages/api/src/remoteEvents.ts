import type { RemoteEventV2 } from '@vibes/models';
import { type ApiClient, api, createApiClient } from './client';

export interface RemoteEventSubscriptionOptions {
  client?: ApiClient;
  remoteId?: string;
  controller?: boolean;
  onRoomUpdate: (event: RemoteEventV2) => void;
  onStateUpdate?: (event: RemoteEventV2) => void;
}

export function subscribeRemoteEvents({
  client: eventClient,
  remoteId,
  controller = false,
  onRoomUpdate,
  onStateUpdate,
}: RemoteEventSubscriptionOptions): Promise<
  [Error | null, (() => void) | null]
> {
  if (!remoteId) return Promise.resolve([null, null]);

  const client =
    eventClient ??
    (controller ? createApiClient({ 'X-Zoff-Remote-ID': remoteId }) : api);
  return client.v2.sse(
    '/remotes/{id}/events',
    { id: remoteId },
    ([eventError, message]) => {
      if (eventError || !message) return;
      if (message.type === 'remote_state_update') {
        onStateUpdate?.(message.data);
        return;
      }
      onRoomUpdate(message.data);
    },
  );
}
