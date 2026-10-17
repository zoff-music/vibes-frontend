import { createMessageSchema, type RoomMessage } from '@vibes/models';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

export async function action({
  input,
  params,
  signal,
}: MutationArgs): Promise<RequestResult<RoomMessage>> {
  const parsed = createMessageSchema.safeParse(input);

  if (!parsed.success)
    return { data: null, error: 'Use between 1 and 500 characters.' };

  const [error, data] = await mobileApi.post(
    '/rooms/{id}/messages',
    { id: params.id },
    parsed.data,
    { signal, retry: 0 },
  );

  return {
    data,
    error: error
      ? await getRequestErrorMessage(
          error,
          'Could not send your message. Try again.',
        )
      : '',
  };
}
