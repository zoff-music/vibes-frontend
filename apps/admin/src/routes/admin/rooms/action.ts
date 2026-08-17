import { getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { AdminRoomSummary } from '@vibes/models';
import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminRoomsActionData {
  error?: string;
  rateLimitMessage?: string;
  rooms?: AdminRoomSummary[];
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
    const [error, rooms] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { name },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: await getRequestErrorMessage(error, 'Failed to rename room.'),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { rooms: rooms ?? [], success: true };
  }

  if (intent === 'clearPassword') {
    const [error, rooms] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { clearAdminPassword: true },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: await getRequestErrorMessage(
          error,
          'Failed to clear room password.',
        ),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { rooms: rooms ?? [], success: true };
  }

  if (intent === 'deleteRoom') {
    const [error, rooms] = await serverApi.delete(
      '/admin/rooms/{id}',
      { id: roomID },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: await getRequestErrorMessage(error, 'Failed to delete room.'),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { rooms: rooms ?? [], success: true };
  }

  return { error: 'Unsupported room action.' };
}
