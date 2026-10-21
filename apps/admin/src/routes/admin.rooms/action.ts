import type { ActionFunctionArgs } from '@kasperrt/smolter/preact';
import { getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { AdminRoomSummaryV2 } from '@vibes/models';
import { getServerApi } from '../../http.server';

export interface AdminRoomsActionData {
  error?: string;
  rateLimitMessage?: string;
  rooms?: AdminRoomSummaryV2[];
  success?: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const roomID = String(formData.get('roomId') ?? '').trim();
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;

  if (intent === 'flagRoom' || intent === 'unflagRoom') {
    const [error, rooms] = await serverApi.v2.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { flagged: intent === 'flagRoom' },
      { headers, signal: request.signal },
    );

    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);

      return {
        error: await getRequestErrorMessage(
          error,
          'Failed to update room flag.',
        ),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return { rooms: rooms ?? [], success: true };
  }

  if (intent === 'renameRoom') {
    const name = String(formData.get('name') ?? '').trim();
    const [error, rooms] = await serverApi.v2.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { name },
      { headers, signal: request.signal },
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
    const [error, rooms] = await serverApi.v2.patch(
      '/admin/rooms/{id}',
      { id: roomID },
      { clearAdminPassword: true },
      { headers, signal: request.signal },
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
    const [error, rooms] = await serverApi.v2.delete(
      '/admin/rooms/{id}',
      { id: roomID },
      { headers, signal: request.signal },
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
