import { getRateLimitMessage } from '@vibes/api';
import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminRoomsActionData {
  error?: string;
  rateLimitMessage?: string;
  success?: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const roomID = String(formData.get('roomId') ?? '').trim();
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;

  if (intent === 'renameRoom') {
    const name = String(formData.get('name') ?? '').trim();
    const [error] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { name },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: rateLimitMessage ?? error.message ?? 'Failed to rename room.',
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { success: true };
  }

  if (intent === 'clearPassword') {
    const [error] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { clearAdminPassword: true },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error:
          rateLimitMessage ?? error.message ?? 'Failed to clear room password.',
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { success: true };
  }

  if (intent === 'deleteRoom') {
    const [error] = await serverApi.delete(
      '/admin/rooms/{id}',
      { id: roomID },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: rateLimitMessage ?? error.message ?? 'Failed to delete room.',
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { success: true };
  }

  return { error: 'Unsupported room action.' };
}
