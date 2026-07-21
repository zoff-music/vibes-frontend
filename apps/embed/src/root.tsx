import type { ReactNode } from 'react';
import type { LinksFunction } from 'react-router';
import { Links, Meta, Scripts } from 'react-router';
import App from './App';
import stylesUrl from './index.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark" />
        <title>Zoff embedded room</title>
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
