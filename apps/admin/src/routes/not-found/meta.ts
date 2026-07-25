import type { MetaFunction } from 'react-router';

export const notFoundMeta: MetaFunction = () => [
  { title: 'Page Not Found | Zoff' },
  {
    name: 'description',
    content: 'The requested Zoff page could not be found.',
  },
];
