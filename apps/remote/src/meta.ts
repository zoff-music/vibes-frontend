import type { MetaFunction } from 'react-router';

export const remoteMeta: MetaFunction = ({ location, error }) => {
  let title = 'Remote Control | Zoff';

  if (location.pathname === '/remotes/join') {
    title = 'Pair a Remote | Zoff';
  }

  if (error) {
    title = 'Remote Unavailable | Zoff';
  }

  return [
    { title },
    { name: 'robots', content: 'noindex, nofollow' },
    {
      name: 'description',
      content: 'Control playback and the shared music queue in your Zoff room.',
    },
  ];
};
