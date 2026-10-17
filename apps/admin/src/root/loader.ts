import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getThemeFromCookies } from '@vibes/serve/theme';
import { loader as loadSession } from '../utils/admin-session/loader';

export interface RootLoaderData {
  admin: Awaited<ReturnType<typeof loadSession>>;
  debug: boolean;
  theme: 'light' | 'dark' | 'auto';
  cspNonce?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('cookie') ?? null;
  const theme = getThemeFromCookies(cookieHeader);
  const cspNonce = (context as { cspNonce?: string } | undefined)?.cspNonce;
  const admin = await loadSession({
    request,
    params: {},
    signal: request.signal,
  });

  return {
    admin,
    debug: process.env.VITE_DEBUG === 'true',
    theme,
    cspNonce,
  } satisfies RootLoaderData;
}
