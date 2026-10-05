import type {
  EmptyObject,
  RemotePairingRequest,
  RemotePairingV2,
  RemoteSessionV2,
  RemoteStatusV2,
  RemoteUpdateRequestV2,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export interface RemoteRequests {
  createRemote: (
    request: RemoteUpdateRequestV2,
    options?: ApiRequestOptions,
  ) => ApiResult<RemotePairingV2>;
  deleteRemote: (
    remoteId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
  fetchOwnedRemote: (options?: ApiRequestOptions) => ApiResult<RemoteStatusV2>;
  fetchRemote: (
    remoteId: string,
    options?: ApiRequestOptions,
  ) => ApiResult<RemoteStatusV2>;
  pairRemote: (
    remoteId: string,
    request: RemotePairingRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<RemoteSessionV2>;
  updateRemote: (
    remoteId: string,
    request: RemoteUpdateRequestV2,
    options?: ApiRequestOptions,
  ) => ApiResult<EmptyObject>;
}

export function createRemoteRequests(client: ApiClient): RemoteRequests {
  return {
    createRemote: (
      request: RemoteUpdateRequestV2,
      options?: ApiRequestOptions,
    ) => client.v2.post('/remotes', null, request, options),
    deleteRemote: (remoteId: string, options?: ApiRequestOptions) =>
      client.delete('/remotes/{id}', { id: remoteId }, options),
    fetchOwnedRemote: (options?: ApiRequestOptions) =>
      client.v2.get('/remotes', null, options),
    fetchRemote: (remoteId: string, options?: ApiRequestOptions) =>
      client.v2.get('/remotes/{id}', { id: remoteId }, options),
    pairRemote: (
      remoteId: string,
      request: RemotePairingRequest,
      options?: ApiRequestOptions,
    ) =>
      client.v2.post(
        '/remotes/{id}/sessions',
        { id: remoteId },
        request,
        options,
      ),
    updateRemote: (
      remoteId: string,
      request: RemoteUpdateRequestV2,
      options?: ApiRequestOptions,
    ) => client.v2.patch('/remotes/{id}', { id: remoteId }, request, options),
  };
}
