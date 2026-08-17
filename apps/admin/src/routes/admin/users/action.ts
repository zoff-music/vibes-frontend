import { getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminUsersActionData {
  completedIntent?: string;
  error?: string;
  message?: string;
  rateLimitMessage?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;

  if (intent === 'createUser') {
    const username = String(formData.get('username') ?? '');
    const password = String(formData.get('password') ?? '');
    const [error, user] = await serverApi.post(
      '/admin/users',
      null,
      { username, password },
      { headers },
    );
    if (error || !user) {
      const rateLimitMessage = error ? getRateLimitMessage(error) : null;
      return {
        error: await getRequestErrorMessage(
          error,
          'Failed to create the admin user.',
        ),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return {
      completedIntent: intent,
      message: `Created ${user.username}.`,
    };
  }

  if (intent === 'resetPassword') {
    const adminID = String(formData.get('adminId') ?? '');
    const password = String(formData.get('password') ?? '');
    const [error] = await serverApi.patch(
      '/admin/users/{id}',
      { id: adminID },
      { password },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: await getRequestErrorMessage(
          error,
          'Failed to reset the admin password.',
        ),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return {
      completedIntent: intent,
      message: 'Password reset. Existing sessions for that admin are invalid.',
    };
  }

  if (intent === 'deleteUser') {
    const adminID = String(formData.get('adminId') ?? '');
    const [error] = await serverApi.delete(
      '/admin/users/{id}',
      { id: adminID },
      { headers },
    );
    if (error) {
      const rateLimitMessage = getRateLimitMessage(error);
      return {
        error: await getRequestErrorMessage(
          error,
          'Failed to delete the admin user.',
        ),
        ...(rateLimitMessage && { rateLimitMessage }),
      };
    }

    return {
      completedIntent: intent,
      message: 'Admin user deleted.',
    };
  }

  return { error: 'Unsupported admin user action.' };
}
