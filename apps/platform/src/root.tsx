import { classNames } from '@vibes/shared';
import retroStylesUrl from '@vibes/ui/konami/styles.css?url';
import regularFontUrl from '@vibes/ui/shared/fonts/MSW98UI-Regular.woff2?url';
import { NotFoundView } from '@vibes/ui/web';
import { lazy, type ReactNode, Suspense, useState } from 'react';
import type { MetaFunction, ShouldRevalidateFunctionArgs } from 'react-router';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { App } from './App';
import { PlatformErrorView } from './components/errors/PlatformErrorView';
import { Background } from './components/layout/Background';
import { SiteLayout } from './components/layout/SiteLayout';
import stylesUrl from './index.css?url';
import { loader, type RootLoaderData } from './root/loader';

export type { RootLoaderData } from './root/loader';
export { loader };

const LazyBeatGame = lazy(() =>
  import('./components/not-found/BeatGame').then((module) => ({
    default: module.BeatGame,
  })),
);

export const meta: MetaFunction = ({ error }) => {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return [
      { title: 'Page Not Found | Zoff' },
      { name: 'robots', content: 'noindex' },
    ];
  }
  return [
    { title: 'Zoff | Shared Music Queue & Listening Rooms' },
    {
      name: 'description',
      content: 'Shared rooms, made for listening together.',
    },
  ];
};

export function shouldRevalidate({
  formAction,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  return (
    formAction === '/resources/profile' && formMethod?.toUpperCase() === 'POST'
  );
}

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
      data-debug={loaderData?.debug === true}
      className={classNames(themeClass, 'motion-safe:scroll-smooth')}
      {...(konamiEnabled && { 'data-konami-mode': 'terminal' })}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-itunes-app" content="app-id=6799954460" />
        <link
          rel="preload"
          href={regularFontUrl}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <Background />
        <SiteLayout>
          <NotFoundView>
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="mx-auto h-92 w-full max-w-sm rounded-3xl border border-theme bg-theme-surface sm:h-102"
                />
              }
            >
              <LazyBeatGame />
            </Suspense>
          </NotFoundView>
        </SiteLayout>
      </>
    );
  }
  return (
    <SiteLayout>
      <PlatformErrorView
        message="Something went wrong. Reload the page or return home."
        title="Zoff is temporarily unavailable"
      />
    </SiteLayout>
  );
}
