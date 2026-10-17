import type { LinksFunction } from '@kasperrt/smolter/preact';
import stylesUrl from '../index.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];
