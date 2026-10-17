import { useRootData, useRouteError } from '@kasperrt/smolter/preact';
import {
  Document,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from '@kasperrt/smolter/preact/document';
import { classNames } from '@vibes/shared';
import {
  FontPreloads,
  MotionProvider,
  publicAssetUrl,
  ThemeScript,
} from '@vibes/ui/web';
import { type ReactNode, useState } from 'preact/compat';
import { App } from './App';
import analyticsUrl from './assets/analytics.js?no-inline&url';
import { isStaleRouteError } from './components/errors/recovery';
import stylesUrl from './index.css?url';
import { ErrorBoundary } from './root/ErrorBoundary';
import { loader, type RootLoaderData } from './root/loader';

export type { RootLoaderData } from './root/loader';

export { meta } from './root/meta';

export { shouldRevalidate } from './root/shouldRevalidate';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const loaderData = useRootData<typeof loader>() as RootLoaderData | undefined;
  const themeId = loaderData?.theme ?? 'auto';
  // Nonce is only relevant for the initial document; keep it stable across client navigations.
  const [cspNonce] = useState(() => loaderData?.cspNonce);
  const themeClass =
    themeId === 'dark' ? 'dark' : themeId === 'light' ? 'theme-light' : '';
  const initialDataJson = JSON.stringify({ theme: themeId });

  return (
    <Document
      lang="en"
      data-debug={loaderData?.debug === true}
      className={classNames(
        themeClass,
        'page-transitions motion-safe:scroll-smooth',
      )}
    >
      <head>
        <meta charSet="UTF-8" />
        <ThemeScript {...(cspNonce && { nonce: cspNonce })} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-itunes-app" content="app-id=6799954460" />
        <FontPreloads />

        <link rel="preload" href={stylesUrl} as="style" fetchPriority="high" />
        <link rel="stylesheet" href={stylesUrl} />
        <link rel="describedby" href="/llms.txt" type="text/plain" />

        <link
          rel="icon"
          type="image/png"
          href={publicAssetUrl('favicon-96x96.png')}
          sizes="96x96"
        />

        <link
          rel="icon"
          type="image/svg+xml"
          href={publicAssetUrl('favicon.svg')}
        />

        <link rel="shortcut icon" href={publicAssetUrl('favicon.ico')} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={publicAssetUrl('apple-touch-icon.png')}
        />

        <link rel="manifest" href="/site.webmanifest" />
        <script defer src={analyticsUrl} />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <MotionProvider>{children}</MotionProvider>
        </div>
        <script id="ssr-data" type="application/json">
          {initialDataJson}
        </script>
        <ScrollRestoration nonce={cspNonce} />
        <Scripts nonce={cspNonce} />
      </body>
    </Document>
  );
}

export default function Root() {
  const error = useRouteError();

  // A lazy route cannot render its own boundary when its chunk is missing.
  if (error instanceof Error && isStaleRouteError(error)) {
    return <ErrorBoundary />;
  }

  return <App />;
}

export { ErrorBoundary } from './root/ErrorBoundary';
