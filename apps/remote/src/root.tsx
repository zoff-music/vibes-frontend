import { type ReactNode, useState } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import { App } from './App';
import stylesUrl from './index.css?url';
import { getThemeClass } from './theme.server';

export function loader({ request }: LoaderFunctionArgs) {
  return {
    cspNonce: undefined as string | undefined,
    themeClass: getThemeClass(request.headers.get('cookie')),
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  const [cspNonce] = useState(() => loaderData?.cspNonce);

  return (
    <html lang="en" className={loaderData?.themeClass}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href={stylesUrl} />
        <title>Zoff Remote</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <ScrollRestoration nonce={cspNonce} />
        <Scripts nonce={cspNonce} />
      </body>
    </html>
  );
}

export default function Root() {
  return <App />;
}
