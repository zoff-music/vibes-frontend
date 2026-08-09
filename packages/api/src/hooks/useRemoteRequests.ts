import type {
  EmptyObject,
  RemotePairingRequest,
  RemoteStatus,
  RemoteUpdateRequest,
} from '@vibes/models';
import { useMemo } from 'react';
import type { ApiClient, ApiResult } from '../index';

export interface RemoteRequests {
  fetchRemote: (remoteId: string) => ApiResult<RemoteStatus>;
  pairRemote: (
    remoteId: string,
    request: RemotePairingRequest,
  ) => ApiResult<RemoteStatus>;
  updateRemote: (
    remoteId: string,
    request: RemoteUpdateRequest,
  ) => ApiResult<EmptyObject>;
}

export function useRemoteRequests(client: ApiClient): RemoteRequests {
  return useMemo(
    () => ({
      fetchRemote: (remoteId: string) =>
        client.get('/remotes/{id}', { id: remoteId }),
      pairRemote: (remoteId: string, request: RemotePairingRequest) =>
        client.post('/remotes/{id}/sessions', { id: remoteId }, request),
      updateRemote: (remoteId: string, request: RemoteUpdateRequest) =>
        client.patch('/remotes/{id}', { id: remoteId }, request),
    }),
    [client],
  );
}
