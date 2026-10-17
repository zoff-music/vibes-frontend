import { useRootData } from '@kasperrt/smolter/preact';
import {
  Document,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from '@kasperrt/smolter/preact/document';
import { FontPreloads, MotionProvider, ThemeScript } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';
import { App } from './App';
import stylesUrl from './index.css?url';
import type { loader } from './root/loader';

interface LayoutProps {
  children: ReactNode;
}

export { remoteMeta as meta } from './root/meta';

export { shouldRevalidate } from './root/shouldRevalidate';

export function Layout({ children }: LayoutProps) {
  const loaderData = useRootData<typeof loader>();

  return (
    <Document
      lang="en"
      className={loaderData?.themeClass}
      data-debug={loaderData?.debug === true}
    >
      <head>
        <meta charSet="UTF-8" />
        <ThemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <FontPreloads />
        <link rel="stylesheet" href={stylesUrl} />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <MotionProvider>{children}</MotionProvider>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </Document>
  );
}

export { ErrorBoundary } from './root/ErrorBoundary';

export default function Root() {
  return <App />;
}
