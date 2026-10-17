import { useURLLocation } from '@kasperrt/smolter/preact';
import {
  Document,
  Links,
  Meta,
  Scripts,
} from '@kasperrt/smolter/preact/document';
import { classNames, parseColorScheme } from '@vibes/shared';
import { FontPreloads, MotionProvider, ThemeScript } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';
import { App } from './App';
import { useEmbedScrollContainment } from './hooks/use-embed-scroll-containment';
import stylesheetUrl from './index.css?url';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  useEmbedScrollContainment();
  const location = useURLLocation();
  const colorScheme = parseColorScheme(location.searchParams.get('theme'));
  const debug = import.meta.env.VITE_DEBUG === 'true';
  const className = classNames(
    'page-transitions h-full overflow-hidden overscroll-none',
    colorSchemeClasses[colorScheme],
  );
  const colorSchemeContent =
    colorScheme === 'auto' ? 'light dark' : colorScheme;

  return (
    <Document lang="en" className={className} data-debug={debug}>
      <head>
        <meta charSet="UTF-8" />
        <ThemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content={colorSchemeContent} />
        <FontPreloads />
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
          <MotionProvider>{children}</MotionProvider>
        </div>
        <Scripts />
      </body>
    </Document>
  );
}

export default function Root() {
  return <App />;
}

export { EmbedRoomErrorBoundary as ErrorBoundary } from './routes/$/components/error-boundary';

const colorSchemeClasses = {
  auto: '',
  dark: 'dark',
  light: 'theme-light',
} as const;
