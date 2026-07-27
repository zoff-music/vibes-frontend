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
    return {
      session: {
        authorized: false,
      },
    };
  }

  return { session };
}
