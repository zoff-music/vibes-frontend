import type { MetaFunction } from '@kasperrt/smolter/preact';
import type { loader } from '../utils/admin-session/loader';

export const adminMeta: MetaFunction<typeof loader> = ({
  location,
  loaderData,
  error,
}) => {
  let title = 'Admin Overview | Zoff';

  if (location.pathname === '/admin/rooms') {
    title = 'Admin Rooms | Zoff';
  }

  if (location.pathname === '/admin/users') {
    title = 'Admin Users | Zoff';
  }

  if (loaderData && 'session' in loaderData && !loaderData.session.authorized) {
    title = 'Admin Sign In | Zoff';
  }

  if (error) {
    title = 'Admin Request Failed | Zoff';
  }

  return [
    { title },
    { name: 'robots', content: 'noindex, nofollow' },
    {
      name: 'description',
      content: 'Manage Zoff shared music rooms and usage.',
    },
  ];
};
