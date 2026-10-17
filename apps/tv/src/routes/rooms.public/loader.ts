import { getRequestErrorMessage } from '@vibes/api';
import type { PublicRoomResultV3 } from '@vibes/models';
import type { RequestArgs, RequestResult } from '@vibes/shared/requests';
import { tvApiV3 } from '@/lib/api';

export async function loader({
  params,
  signal,
}: RequestArgs): Promise<RequestResult<PublicRoomResultV3>> {
  const offset = Number(params.from ?? 0);
  const from = Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  const [error, data] = await tvApiV3.get(
    '/rooms/public',
    {
      $search: {
        roomType: params.roomType === 'WATCH' ? 'WATCH' : 'MUSIC',
        live: false,
        q: (params.q ?? '').slice(0, 100),
        from,
        to: from + 11,
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
