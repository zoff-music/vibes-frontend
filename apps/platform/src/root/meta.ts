import {
  isRouteErrorResponse,
  type MetaFunction,
} from '@kasperrt/smolter/preact';

export const meta: MetaFunction = ({ error }) => {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return [
      {
        title: 'Page Not Found | Zoff',
      },
      {
        name: 'robots',
        content: 'noindex',
      },
    ];
  }

  return [
    {
      title: 'Zoff | Shared Music Queue & Listening Rooms',
    },
    {
      name: 'description',
      content: 'Shared rooms, made for listening together.',
    },
  ];
};
