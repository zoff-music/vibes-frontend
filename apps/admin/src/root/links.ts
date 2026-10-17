import type { LinksFunction } from '@kasperrt/smolter/preact';
import stylesUrl from '../index.css?url';

export const links: LinksFunction = (): ReturnType<LinksFunction> => [
  { rel: 'preload', href: stylesUrl, as: 'style' },
  { rel: 'stylesheet', href: stylesUrl },
];
