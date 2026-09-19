import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const meta: MetaFunction = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const isFiltered =
    params.has('q') || params.has('from') || params.has('live');

  return [
    ...pageMetadata(
      '/explore/rooms',
      'Explore Public Rooms | Zoff',
      'Browse public Zoff rooms. Join people listening now, search for a room by name, or start listening to a quiet queue. Free, with no registration.',
    ),
    ...(isFiltered ? [{ name: 'robots', content: 'noindex, follow' }] : []),
  ];
};
