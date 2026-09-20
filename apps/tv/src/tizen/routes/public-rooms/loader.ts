import { getRequestErrorMessage } from '@vibes/api';
import type { PublicRoomResult } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { tizenApiV2 } from '@/tizen/api';

export interface PublicRoomsData {
  result: PublicRoomResult | null;
  error: string;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<PublicRoomsData> {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get('from') ?? 0);
  const from = Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  const [error, result] = await tizenApiV2.get(
    '/rooms/public',
    {
      $search: {
        live: false,
        q: (params.get('q') ?? '').slice(0, 100),
        from,
        to: from + 11,
      },
    },
    { signal: request.signal, retry: 0 },
  );
  return {
    result,
    error: error
      ? await getRequestErrorMessage(error, 'Could not load rooms. Try again.')
      : '',
  };
}
