import { useRootData } from '@kasperrt/smolter/preact';
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
import type { loader, RootLoaderData } from './root/loader';

interface LayoutProps {
  children: ReactNode;
}

export { links } from './root/links';
export type { RootLoaderData } from './root/loader';
export { adminMeta as meta } from './root/meta';

export function Layout({ children }: LayoutProps) {
  const loaderData = useRootData<typeof loader>() as RootLoaderData | undefined;
  const themeId = loaderData?.theme ?? 'auto';
  // Nonce is only relevant for the initial document; keep it stable across client navigations.
  const [cspNonce] = useState(() => loaderData?.cspNonce);
  const themeClass =
    themeId === 'dark' ? 'dark' : themeId === 'light' ? 'theme-light' : '';
  const initialDataJson = JSON.stringify(loaderData ?? {});

  return (
    <Document
      lang="en"
      className={classNames(themeClass, 'page-transitions')}
      data-debug={loaderData?.debug === true}
    >
      <head>
        <meta charSet="UTF-8" />
        <ThemeScript {...(cspNonce && { nonce: cspNonce })} />
        <FontPreloads />
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  return <App />;
}

export { ErrorBoundary } from './root/ErrorBoundary';
