import { classNames, parseColorScheme } from '@vibes/shared';
import regularFontUrl from '@vibes/ui/shared/fonts/MSW98UI-Regular-latin.woff2?url';
import type { ReactNode } from 'react';
import {
  Links,
  type LoaderFunctionArgs,
  Meta,
  Scripts,
  useLoaderData,
} from 'react-router';
import { App } from './App';
import logoUrl from './assets/logo.png';
import { useEmbedScrollContainment } from './hooks/use-embed-scroll-containment';
import stylesUrl from './index.css?url';
import { EmbedRoomErrorBoundary } from './routes/embed.$roomId/components/error-boundary';

export function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const stylesheetFilename = stylesUrl.slice(stylesUrl.lastIndexOf('/') + 1);
  const logoFilename = logoUrl.slice(logoUrl.lastIndexOf('/') + 1);
  const fontFilename = regularFontUrl.slice(
    regularFontUrl.lastIndexOf('/') + 1,
  );
  return {
    debug: process.env.VITE_DEBUG === 'true',
    logoUrl: `${embedBasePath}/assets/${logoFilename}`,
    fontUrl: `${embedBasePath}/assets/${fontFilename}`,
    stylesheetUrl: `${embedBasePath}/assets/${stylesheetFilename}`,
    colorScheme: parseColorScheme(requestUrl.searchParams.get('theme')),
  };
}

export type RootLoaderData = ReturnType<typeof loader>;

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  useEmbedScrollContainment();
  const { stylesheetUrl, fontUrl, colorScheme, debug } =
    useLoaderData<typeof loader>();
  const className = classNames(
    'h-full overflow-hidden overscroll-none',
    colorSchemeClasses[colorScheme],
  );
  const colorSchemeContent =
    colorScheme === 'auto' ? 'light dark' : colorScheme;
  return (
    <html lang="en" className={className} data-debug={debug}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content={colorSchemeContent} />
        <link
          rel="preload"
          href={fontUrl}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={stylesheetUrl}
          as="style"
          fetchPriority="high"
        />
        <link rel="stylesheet" href={stylesheetUrl} />
        <Meta />
        <Links />
      </head>
      <body className="h-full overflow-hidden overscroll-none">
        <div id="root" className="h-full overflow-hidden overscroll-none">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <App />;
}

export const ErrorBoundary = EmbedRoomErrorBoundary;

const colorSchemeClasses = {
  auto: '',
  dark: 'dark',
  light: 'theme-light',
} as const;
