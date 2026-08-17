import type {
  EmptyObject,
  RemotePairing,
  RemotePairingRequest,
  RemoteSession,
  RemoteStatus,
  RemoteUpdateRequest,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export interface RemoteRequests {
  createRemote: (
    request: RemoteUpdateRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<RemotePairing>;
  deleteRemote: (
    remoteId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
  fetchOwnedRemote: (options?: ApiRequestOptions) => ApiResult<RemoteStatus>;
  fetchRemote: (
    remoteId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<RemoteStatus>;
  pairRemote: (
    remoteId: string,
    request: RemotePairingRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<RemoteSession>;
  updateRemote: (
    remoteId: string,
    request: RemoteUpdateRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
}

export function createRemoteRequests(client: ApiClient): RemoteRequests {
  return {
    createRemote: (request: RemoteUpdateRequest, options?: ApiRequestOptions) =>
      client.post('/remotes', null, request, options),
    deleteRemote: (remoteId: string, options?: ApiRequestOptions) =>
      client.delete('/remotes/{id}', { id: remoteId }, options),
    fetchOwnedRemote: (options?: ApiRequestOptions) =>
      client.get('/remotes', null, options),
    fetchRemote: (remoteId: string, options?: ApiRequestOptions) =>
      client.get('/remotes/{id}', { id: remoteId }, options),
    pairRemote: (
      remoteId: string,
      request: RemotePairingRequest,
      options?: ApiRequestOptions,
    ) =>
      client.post('/remotes/{id}/sessions', { id: remoteId }, request, options),
    updateRemote: (
      remoteId: string,
      request: RemoteUpdateRequest,
      options?: ApiRequestOptions,
    ) => client.patch('/remotes/{id}', { id: remoteId }, request, options),
  };
}
