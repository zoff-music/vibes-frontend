import {
  api,
  createSessionProfileRequests,
  getRequestErrorMessage,
} from '@vibes/api';
import type { SessionProfile } from '@vibes/models';

export interface ProfileRouteData {
  error?: string;
  profile?: SessionProfile;
}

const requests = createSessionProfileRequests(api);

export async function clientLoader(): Promise<ProfileRouteData> {
  const [error, profile] = await requests.fetchSessionProfile();
  if (error || !profile) {
    return {
      error: await getRequestErrorMessage(error, 'Could not load your name.'),
    };
  }

  return { profile };
}
