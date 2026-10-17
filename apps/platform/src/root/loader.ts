import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import type { RemoteStatusV2, SessionProfile } from '@vibes/models';
import { getThemeFromCookies } from '@vibes/serve/theme';
import { getServerApi } from '../http.server';
import { createEmptyRemoteStatus } from '../utils/remoteStatus';

interface RootContext {
  cspNonce?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('cookie') ?? null;
  const theme = getThemeFromCookies(cookieHeader);
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const cspNonce = (context as RootContext | undefined)?.cspNonce;
  const headers: Record<string, string> = {};

  if (cookieHeader) headers.Cookie = cookieHeader;

  const serverApi = getServerApi(request);
  // Optional session UI must not hold every document through retry backoff.
  const options = {
    headers,
    retry: 0,
    signal: request.signal,
  };
  const hasSession = (cookieHeader ?? '')
    .split(';')
    .some((cookie) => /^session=.+/.test(cookie.trim()));

  const sessionProfile: Promise<SessionProfile | null> = hasSession
    ? serverApi
        .get('/sessions', null, options)
        .then(([error, profile]) => (error ? null : profile))
    : Promise.resolve(null);

  // Remote status gates playback so paired devices never start a second player.
  const remoteResult = hasSession
    ? await serverApi.v2.get('/remotes', null, options)
    : null;
  const [remoteError, remote] = remoteResult ?? [null, null];

  const remoteStatus: RemoteStatusV2 =
    remoteError || !remote ? createEmptyRemoteStatus() : remote;

  return {
    debug: process.env.VITE_DEBUG === 'true',
    theme,
    embedBasePath,
    cspNonce,
    remoteStatus,
    sessionProfile: await sessionProfile,
  };
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>;
