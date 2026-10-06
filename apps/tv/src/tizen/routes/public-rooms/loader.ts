import { getRequestErrorMessage } from '@vibes/api';
import type { PublicRoomResultV3 } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { tizenApiV3 } from '@/tizen/api';

export interface PublicRoomsData {
  result: PublicRoomResultV3 | null;
  error: string;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<PublicRoomsData> {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get('from') ?? 0);
  const from = Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  const [error, result] = await tizenApiV3.get(
    '/rooms/public',
    {
      $search: {
        roomType: params.get('type') === 'watch' ? 'WATCH' : 'MUSIC',
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
