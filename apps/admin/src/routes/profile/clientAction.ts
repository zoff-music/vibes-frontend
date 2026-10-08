import {
  api,
  createSessionProfileRequests,
  getRequestErrorMessage,
} from '@vibes/api';
import { updateSessionProfileRequestSchema } from '@vibes/models';
import type { ClientActionFunctionArgs } from 'react-router';
import type { ProfileRouteData } from './clientLoader';

const requests = createSessionProfileRequests(api);

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<ProfileRouteData> {
  const formData = await request.formData();
  const name = formData.get('name');
  const parsed = updateSessionProfileRequestSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid name.' };
  }

  const [error, profile] = await requests.updateSessionProfile(parsed.data);
  if (error || !profile) {
    return {
      error: await getRequestErrorMessage(error, 'Could not save your name.'),
    };
  }

  return { profile };
}
