import type { PublicRoomResult } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApiV2 } from '@/lib/api';

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<PublicRoomResult>> {
  const parsedFrom = Number(params.from ?? 0);
  const from =
    Number.isSafeInteger(parsedFrom) && parsedFrom >= 0 ? parsedFrom : 0;
  const [error, data] = await mobileApiV2.get(
    '/rooms/public',
    {
      $search: {
        live: params.live !== 'false',
        q: (params.q ?? '').slice(0, 100),
        from,
        to: from + 9,
      },
    },
    { signal, retry: 0 },
  );
  return {
    data,
    error: error
      ? await getRequestErrorMessage(error, 'Could not load rooms. Try again.')
      : '',
  };
}
