import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getHttpError } from '@vibes/api';
import type { AdminUser } from '@vibes/models';
import { getServerApi } from '../../http.server';

export interface AdminUsersLoaderData {
  users: AdminUser[];
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminUsersLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [error, users] = await serverApi.get('/admin/users', null, {
    signal: request.signal,
    headers,
  });

  if (error || !users) {
    const status = error ? getHttpError(error)?.response.status : null;

    if (status === 401 || status === 403) {
      return { users: [] };
    }

    throw new Response('Admin users temporarily unavailable', {
      status: 503,
      statusText: 'Admin users temporarily unavailable',
    });
  }

  return { users };
}
