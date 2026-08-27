import {
  api,
  createSessionProfileRequests,
  getRequestErrorMessage,
} from '@vibes/api';
import type { ClientActionFunctionArgs } from 'react-router';
import type { ProfileRouteData } from './clientLoader';

const requests = createSessionProfileRequests(api);

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<ProfileRouteData> {
  const formData = await request.formData();
  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'Enter a name.' };
  }

  const [error, profile] = await requests.updateSessionProfile({
    name: name.trim(),
  });
  if (error || !profile) {
    return {
      error: await getRequestErrorMessage(error, 'Could not save your name.'),
    };
  }

  return { profile };
}
