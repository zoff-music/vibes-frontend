import { getRateLimitMessage } from '@vibes/api';
import { type ActionFunctionArgs, data, redirect } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminActionData {
  error?: string;
  rateLimitMessage?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  let setCookieHeader = '';
  const serverApi = getServerApi(request, {
    fetchLifecycle: {
      afterResponse(apiRequest, response) {
        if (!apiRequest.url.includes('/admin/sessions')) {
          return;
        }

        setCookieHeader = response.headers.get('set-cookie') ?? '';
      },
    },
  });
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;

  if (intent === 'logout') {
    const [error] = await serverApi.delete('/admin/sessions', null, {
      headers,
    });
    if (error) {
      return getActionError(error, 'Failed to sign out.');
    }

    return redirect('/admin', {
      headers: getResponseHeaders(setCookieHeader),
    });
  }

  if (intent !== 'login') {
    return data<AdminActionData>(
      { error: 'Unsupported admin action.' },
      { status: 400 },
    );
  }

  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');
  const [error, session] = await serverApi.post(
    '/admin/sessions',
    null,
    { username, password },
    { headers },
  );
  if (error || !session?.authorized) {
    return getActionError(error, 'Invalid admin username or password.');
  }

  return redirect('/admin', {
    headers: getResponseHeaders(setCookieHeader),
  });
}

function getActionError(error: Error | null, fallback: string) {
  const rateLimitMessage = error ? getRateLimitMessage(error) : null;
  return {
    error: rateLimitMessage ?? fallback,
    ...(rateLimitMessage && { rateLimitMessage }),
  };
}

function getResponseHeaders(setCookieHeader: string) {
  if (!setCookieHeader) {
    return undefined;
  }

  return {
    'Set-Cookie': setCookieHeader,
  };
}
