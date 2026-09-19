import { createMessageSchema, type RoomMessage } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<RoomMessage>> {
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
