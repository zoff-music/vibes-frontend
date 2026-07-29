import type { ReactNode } from 'react';
import { Links, Meta, Scripts, useLoaderData } from 'react-router';
import { App } from './App';
import logoUrl from './assets/logo.png';
import stylesUrl from './index.css?url';

export function loader() {
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const stylesheetFilename = stylesUrl.slice(stylesUrl.lastIndexOf('/') + 1);
  const logoFilename = logoUrl.slice(logoUrl.lastIndexOf('/') + 1);
  return {
    logoUrl: `${embedBasePath}/assets/${logoFilename}`,
    stylesheetUrl: `${embedBasePath}/assets/${stylesheetFilename}`,
  };
}

export type RootLoaderData = ReturnType<typeof loader>;

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const { stylesheetUrl } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark" />
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
      <body>
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <App />;
}
