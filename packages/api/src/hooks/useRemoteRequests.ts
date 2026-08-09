import type {
  EmptyObject,
  RemotePairing,
  RemotePairingRequest,
  RemoteSession,
  RemoteStatus,
  RemoteUpdateRequest,
} from '@vibes/models';
import { useMemo } from 'react';
import type { ApiClient, ApiResult } from '../index';

export interface RemoteRequests {
  createRemote: (request: RemoteUpdateRequest) => ApiResult<RemotePairing>;
  deleteRemote: (remoteId: string) => ApiResult<EmptyObject>;
  fetchOwnedRemote: () => ApiResult<RemoteStatus>;
  fetchRemote: (remoteId: string) => ApiResult<RemoteStatus>;
  pairRemote: (
    remoteId: string,
    request: RemotePairingRequest,
  ) => ApiResult<RemoteSession>;
  updateRemote: (
    remoteId: string,
    request: RemoteUpdateRequest,
  ) => ApiResult<EmptyObject>;
}

export function useRemoteRequests(client: ApiClient): RemoteRequests {
  return useMemo(
    () => ({
      createRemote: (request: RemoteUpdateRequest) =>
        client.post('/remotes', null, request),
      deleteRemote: (remoteId: string) =>
        client.delete('/remotes/{id}', { id: remoteId }),
      fetchOwnedRemote: () => client.get('/remotes', null),
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
