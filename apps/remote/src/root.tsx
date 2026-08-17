import type { ReactNode } from 'react';
import type {
  LoaderFunctionArgs,
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
import { RemoteErrorView } from './components/RemoteErrorView';
import stylesUrl from './index.css?url';
import { getPublicRouteErrorMessage } from './routeError';
import { getThemeClass } from './theme.server';

export function loader({ request }: LoaderFunctionArgs) {
  return {
    themeClass: getThemeClass(request.headers.get('cookie')),
  };
}

export function shouldRevalidate({
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
}

export function Layout({ children }: { children: ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();

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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <RemoteErrorView
      message={getPublicRouteErrorMessage(error)}
      title="Remote unavailable"
    />
  );
}

export default function Root() {
  return <App />;
}
