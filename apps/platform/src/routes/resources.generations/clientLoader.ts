import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api, getHttpError } from '@vibes/api';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^[1-9]\d*$/.test(id)) return { id, generation: null, missing: true };

  const [error, generation] = await api.get(
    '/generations/{id}',
    { id },
    {
      retry: 0,
      signal: request.signal,
    },
  );

  if (error) {
    const status = getHttpError(error)?.response.status;

    return { id, generation: null, missing: status === 404 || status === 401 };
  }

  return { id, generation, missing: false };
}
