import { getHttpError } from '@vibes/api';
import type { AdminSessionResponse } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminLoaderData {
  session: AdminSessionResponse;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [error, session] = await serverApi.get('/admin/sessions', null, {
    headers,
  });

  if (error || !session) {
    const status = error ? getHttpError(error)?.response.status : null;
    if (status !== 401 && status !== 403) {
      throw new Response('Admin session temporarily unavailable', {
        status: 503,
        statusText: 'Admin session temporarily unavailable',
      });
    }
    return {
      session: {
        authorized: false,
      },
    };
  }

  return { session };
}
