import { createSessionProfileRequests } from '@vibes/api';
import type { SessionProfile } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface SessionProfileActionInput {
  name: string;
}

const requests = createSessionProfileRequests(mobileApi);

export async function action({
  input,
  signal,
}: ActionFunctionArgs): Promise<DataResult<SessionProfile>> {
  if (!isSessionProfileActionInput(input) || !input.name.trim()) {
    return { data: null, error: 'Enter a name.' };
  }

  const [error, profile] = await requests.updateSessionProfile(
    { name: input.name.trim() },
    { signal },
  );
  if (error || !profile) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not save your name.'),
    };
  }

  return { data: profile, error: '' };
}

function isSessionProfileActionInput(
  input: unknown,
): input is SessionProfileActionInput {
  return Boolean(
    input &&
      typeof input === 'object' &&
      'name' in input &&
      typeof input.name === 'string',
  );
}
