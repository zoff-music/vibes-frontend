import type { AdminRoomSummary } from '@vibes/models';
import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminActionData {
  authorized?: boolean;
  error?: string;
  rooms?: AdminRoomSummary[];
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<AdminActionData> {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;

  if (intent === 'logout') {
    const [logoutError] = await serverApi.delete('/admin/sessions', null, {
      headers: requestHeaders,
    });
    if (logoutError) {
      return { error: 'Failed to sign out.' };
    }
    return { authorized: false, rooms: [] };
  }

  if (intent === 'login') {
    const password = String(formData.get('password') ?? '').trim();
    const [loginError, response] = await serverApi.post(
      '/admin/sessions',
      null,
      { password },
      { headers: requestHeaders },
    );
    if (loginError || !response?.authorized) {
      return { authorized: false, error: 'Invalid admin password.' };
    }
  }

  const [roomsError, rooms] = await serverApi.get('/admin/rooms', null, {
    headers: requestHeaders,
  });
  if (roomsError || !rooms) {
    return {
      authorized: intent === 'login' ? true : undefined,
      error: roomsError?.message ?? 'Failed to refresh rooms.',
    };
  }

  return {
    authorized: true,
    rooms,
  };
}
