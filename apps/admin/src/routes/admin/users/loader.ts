import type { AdminUser } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

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
    headers,
  });

  return {
    users: error || !users ? [] : users,
  };
}
