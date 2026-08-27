import type { RemoteStatus, SessionProfile } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../http.server';
import { getKonamiModeFromCookies } from '../ssr/konamiMode.server';
import { getThemeFromCookies } from '../ssr/theme.server';
import { createEmptyRemoteStatus } from '../utils/remoteStatus';

interface RootContext {
  cspNonce?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('cookie') ?? null;
  const theme = getThemeFromCookies(cookieHeader);
  const konamiEnabled = getKonamiModeFromCookies(cookieHeader);
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const cspNonce = (context as RootContext | undefined)?.cspNonce;
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const serverApi = getServerApi(request);
  const [remoteResult, profileResult] = await Promise.all([
    serverApi.get('/remotes', null, { headers }),
    serverApi.get('/sessions', null, { headers }),
  ]);
  const [remoteError, remote] = remoteResult;
  const [profileError, profile] = profileResult;
  const remoteStatus: RemoteStatus =
    remoteError || !remote ? createEmptyRemoteStatus() : remote;
  const sessionProfile: SessionProfile | null =
    profileError || !profile ? null : profile;
  return {
    theme,
    embedBasePath,
    cspNonce,
    konamiEnabled,
    remoteStatus,
    sessionProfile,
  };
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>;
