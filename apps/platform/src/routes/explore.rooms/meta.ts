import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const meta: MetaFunction = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const watch = params.get('type') === 'watch';
  const isFiltered =
    params.has('q') || params.has('from') || params.has('live');

  return [
    ...pageMetadata(
      watch ? '/rooms/explore?type=watch' : '/rooms/explore',
      watch
        ? 'Explore Public Watch Rooms | Zoff'
        : 'Explore Public Music Rooms | Zoff',
      watch
        ? 'Browse public Zoff watch rooms. Find people watching together, search for a room by name and join a shared video queue. Free, with no registration.'
        : 'Browse public Zoff music rooms. Join people listening now, search for a room by name, or start listening to a quiet queue. Free, with no registration.',
    ),
    ...(isFiltered ? [{ name: 'robots', content: 'noindex, follow' }] : []),
  ];
};
