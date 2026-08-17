import retroStylesUrl from '@vibes/ui/konami/styles.css?url';
import { type ReactNode, useState } from 'react';
import type {
  LoaderFunctionArgs,
  MetaFunction,
  ShouldRevalidateFunctionArgs,
} from 'react-router';
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { App } from './App';
import { PlatformErrorView } from './components/errors/PlatformErrorView';
import stylesUrl from './index.css?url';
import { getKonamiModeFromCookies } from './ssr/konamiMode.server';
import { getThemeFromCookies } from './ssr/theme.server';

interface RootContext {
  cspNonce?: string;
}

export const meta: MetaFunction = () => [
  { title: 'ゾフ - Shared Music Queue' },
  {
    name: 'description',
    content: 'Shared music rooms, made for listening together.',
  },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('cookie') ?? null;
  const theme = getThemeFromCookies(cookieHeader);
  const konamiEnabled = getKonamiModeFromCookies(cookieHeader);
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const cspNonce = (context as RootContext | undefined)?.cspNonce;
  return { theme, embedBasePath, cspNonce, konamiEnabled };
}

export function shouldRevalidate({
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
}

export type RootLoaderData = Awaited<ReturnType<typeof loader>>;

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const loaderData = useLoaderData<typeof loader>() as
    | RootLoaderData
    | undefined;
  const themeId = loaderData?.theme ?? 'auto';
  // Nonce is only relevant for the initial document; keep it stable across client navigations.
  const [cspNonce] = useState(() => loaderData?.cspNonce);
  const themeClass =
    themeId === 'dark' ? 'dark' : themeId === 'light' ? 'theme-light' : '';
  const initialDataJson = JSON.stringify(loaderData ?? {});
  const konamiEnabled = loaderData?.konamiEnabled ?? false;

  return (
    <html
      lang="en"
      className={themeClass}
      {...(konamiEnabled && { 'data-konami-mode': 'terminal' })}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preload" href={stylesUrl} as="style" fetchPriority="high" />
        <link rel="stylesheet" href={stylesUrl} />
        {konamiEnabled && <link rel="stylesheet" href={retroStylesUrl} />}
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script defer src="/plausible-init.js" />
        <script
          defer
          data-domain="zoff.me"
          src="https://analytics.zoff.me/js/script.outbound-links.tagged-events.js"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <script id="ssr-data" type="application/json">
          {initialDataJson}
        </script>
        <ScrollRestoration nonce={cspNonce} />
        <Scripts nonce={cspNonce} />
      </body>
    </html>
  );
}

export default function Root() {
  return <App />;
}

export function ErrorBoundary() {
  useRouteError();
  return (
    <PlatformErrorView
      message="Something went wrong. Reload the page or return home."
      title="Zoff is temporarily unavailable"
    />
  );
}
