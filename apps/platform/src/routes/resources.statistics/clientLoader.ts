import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api } from '@vibes/api';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const roomType =
    new URL(request.url).searchParams.get('type') === 'watch'
      ? 'WATCH'
      : 'MUSIC';
  const [error, stats] = await api.v2.get(
    '/stats',
    { $search: { roomType } },
    {
      retry: 0,
      signal: request.signal,
      cacheRequest: true,
      cacheTimeToLive: 10_000,
    },
  );

  return { roomType, stats: error ? null : stats };
}
