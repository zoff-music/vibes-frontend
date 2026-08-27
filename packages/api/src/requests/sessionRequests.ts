import type {
  SessionProfile,
  UpdateSessionProfileRequest,
} from '@vibes/models';
import type { ApiClient, ApiRequestOptions, ApiResult } from '../client';

export interface SessionProfileRequests {
  fetchSessionProfile: (
    options?: ApiRequestOptions,
  ) => ApiResult<SessionProfile>;
  updateSessionProfile: (
    request: UpdateSessionProfileRequest,
    options?: ApiRequestOptions,
  ) => ApiResult<SessionProfile>;
}

export function createSessionProfileRequests(
  client: ApiClient,
): SessionProfileRequests {
  return {
    fetchSessionProfile: (options?: ApiRequestOptions) =>
      client.get('/sessions', null, options),
    updateSessionProfile: (
      request: UpdateSessionProfileRequest,
      options?: ApiRequestOptions,
    ) => client.patch('/sessions', null, request, options),
  };
}
