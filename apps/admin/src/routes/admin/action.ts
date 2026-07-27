import { getRateLimitMessage } from '@vibes/api';
import type { AdminRoomResult, AdminSearchUsage } from '@vibes/models';
import { type ActionFunctionArgs, data } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminActionData {
  authorized?: boolean;
  error?: string;
  rateLimitMessage?: string;
  roomResult?: AdminRoomResult;
  roomsUpdated?: boolean;
  searchUsage?: AdminSearchUsage;
}

function getAdminActionError(error: Error | null, fallback: string) {
  const rateLimitMessage = error ? getRateLimitMessage(error) : null;
  return {
    error: rateLimitMessage ?? fallback,
    ...(rateLimitMessage && { rateLimitMessage }),
  };
}

function getCookiePair(setCookieHeader: string) {
  return setCookieHeader.split(';', 1)[0]?.trim() ?? '';
}

function getCookieName(cookiePair: string) {
  return cookiePair.split('=', 1)[0]?.trim() ?? '';
}

function createRequestHeaders(
  cookieHeader: string | undefined,
  setCookieHeader: string | undefined,
) {
  if (!cookieHeader && !setCookieHeader) {
    return undefined;
  }

  const setCookiePair = setCookieHeader ? getCookiePair(setCookieHeader) : '';
  const setCookieName = setCookiePair ? getCookieName(setCookiePair) : '';
  const incomingCookies = (cookieHeader ?? '')
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie)
    .filter((cookie) => {
      if (!setCookieName) {
        return true;
      }
      return getCookieName(cookie) !== setCookieName;
    });

  if (setCookiePair) {
    incomingCookies.push(setCookiePair);
  }

  const cookie = incomingCookies.join('; ');
  if (!cookie) {
    return undefined;
  }

  return { Cookie: cookie };
}

function createActionDataResponse(
  payload: AdminActionData,
  setCookieHeader: string | undefined,
) {
  if (!setCookieHeader) {
    return payload;
  }

  return data(payload, {
    headers: {
      'Set-Cookie': setCookieHeader,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  let adminSessionSetCookie: string | undefined;
  const serverApi = getServerApi(request, {
    fetchLifecycle: {
      afterResponse(apiRequest, response) {
        if (!apiRequest.url.includes('/admin/sessions')) {
          return;
        }

        adminSessionSetCookie = response.headers.get('set-cookie') ?? undefined;
      },
    },
  });
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  let requestHeaders = createRequestHeaders(cookieHeader, undefined);

  if (intent === 'logout') {
    const [logoutError] = await serverApi.delete('/admin/sessions', null, {
      headers: requestHeaders,
    });
    if (logoutError) {
      return getAdminActionError(logoutError, 'Failed to sign out.');
    }
    return createActionDataResponse(
      {
        authorized: false,
        roomResult: { rooms: [], from: 0, to: 0, total: 0, count: 0 },
        searchUsage: { summaries: [], generatedAt: '' },
      },
      adminSessionSetCookie,
    );
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
      return {
        authorized: false,
        ...getAdminActionError(loginError, 'Invalid admin password.'),
      };
    }
    requestHeaders = createRequestHeaders(cookieHeader, adminSessionSetCookie);
  }

  if (intent === 'renameRoom') {
    const roomId = String(formData.get('roomId') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const [renameError] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomId },
      { name },
      { headers: requestHeaders },
    );
    if (renameError) {
      return createActionDataResponse(
        {
          authorized: true,
          ...getAdminActionError(
            renameError,
            renameError?.message ?? 'Failed to rename room.',
          ),
        },
        adminSessionSetCookie,
      );
    }

    return createActionDataResponse(
      { authorized: true, roomsUpdated: true },
      adminSessionSetCookie,
    );
  }

  if (intent === 'clearPassword') {
    const roomId = String(formData.get('roomId') ?? '').trim();
    const [clearError] = await serverApi.patch(
      '/admin/rooms/{id}',
      { id: roomId },
      { clearAdminPassword: true },
      { headers: requestHeaders },
    );
    if (clearError) {
      return createActionDataResponse(
        {
          authorized: true,
          ...getAdminActionError(
            clearError,
            clearError?.message ?? 'Failed to clear room password.',
          ),
        },
        adminSessionSetCookie,
      );
    }

    return createActionDataResponse(
      { authorized: true, roomsUpdated: true },
      adminSessionSetCookie,
    );
  }

  if (intent === 'deleteRoom') {
    const roomId = String(formData.get('roomId') ?? '').trim();
    const [deleteError] = await serverApi.delete(
      '/admin/rooms/{id}',
      { id: roomId },
      { headers: requestHeaders },
    );
    if (deleteError) {
      return createActionDataResponse(
        {
          authorized: true,
          ...getAdminActionError(
            deleteError,
            deleteError?.message ?? 'Failed to delete room.',
          ),
        },
        adminSessionSetCookie,
      );
    }

    return createActionDataResponse(
      { authorized: true, roomsUpdated: true },
      adminSessionSetCookie,
    );
  }

  const q = String(formData.get('q') ?? '').trim();
  const sortBy =
    String(formData.get('sortBy') ?? '') === 'songs' ? 'songs' : 'listeners';
  const order = String(formData.get('order') ?? '') === 'asc' ? 'asc' : 'desc';
  const parsedFrom = Number.parseInt(String(formData.get('from') ?? ''), 10);
  const from = Number.isNaN(parsedFrom) ? 0 : Math.max(0, parsedFrom);
  const parsedTo = Number.parseInt(String(formData.get('to') ?? ''), 10);
  const to = Number.isNaN(parsedTo)
    ? from + adminRoomPageSize - 1
    : Math.max(from, parsedTo);

  const [roomsResult, usageResult] = await Promise.all([
    serverApi.get(
      '/admin/rooms',
      {
        $search: {
          ...(q && { q }),
          sortBy,
          order,
          from,
          to,
        },
      },
      {
        headers: requestHeaders,
      },
    ),
    serverApi.get('/admin/searches/usage', null, {
      headers: requestHeaders,
    }),
  ]);
  const [roomsError, roomResult] = roomsResult;
  const [usageError, searchUsage] = usageResult;
  if (roomsError || !roomResult) {
    const isAuthCheck = intent === 'refresh';
    const actionError = getAdminActionError(
      roomsError,
      roomsError?.message ?? 'Failed to refresh rooms.',
    );
    return createActionDataResponse(
      {
        authorized: intent === 'login',
        ...(!isAuthCheck && { error: actionError.error }),
        ...(actionError.rateLimitMessage && {
          error: actionError.error,
          rateLimitMessage: actionError.rateLimitMessage,
        }),
      },
      adminSessionSetCookie,
    );
  }

  return createActionDataResponse(
    {
      authorized: true,
      roomResult,
      searchUsage: usageError
        ? { summaries: [], generatedAt: '' }
        : (searchUsage ?? { summaries: [], generatedAt: '' }),
    },
    adminSessionSetCookie,
  );
}

const adminRoomPageSize = 12;
