import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const meta: MetaFunction = ({ location }) => {
  const watch = new URLSearchParams(location.search).get('type') === 'watch';

  if (watch) {
    return pageMetadata(
      '/rooms/create?type=watch',
      'Create a Shared Watch Room | Zoff',
      'Create a free watch room with synchronized YouTube playback, a shared video queue, voting and host controls. Share a link and watch together.',
    );
  }

  return pageMetadata(
    '/rooms/create',
    'Create a Shared Music Room | Zoff',
    'Create a free shared music room with synchronized playback, collaborative queues, song voting and host controls. Share a room link and listen together.',
  );
};
