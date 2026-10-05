import type { PublicRoomResultV3 } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { mobileRoomPageSize } from '@/constants/public-rooms';
import { getRequestErrorMessage, mobileApiV3 } from '@/lib/api';

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<PublicRoomResultV3>> {
  const parsedFrom = Number(params.from ?? 0);
  const from =
    Number.isSafeInteger(parsedFrom) && parsedFrom >= 0 ? parsedFrom : 0;
  const [error, data] = await mobileApiV3.get(
    '/rooms/public',
    {
      $search: {
        live: params.live !== 'false',
        q: (params.q ?? '').slice(0, 100),
        from,
        to: from + mobileRoomPageSize - 1,
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
