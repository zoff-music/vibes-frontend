import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const meta: MetaFunction = () =>
  pageMetadata(
    '/rooms/create',
    'Create a Shared Music Room | Zoff',
    'Create a free shared music room with synchronized playback, collaborative queues, song voting and host controls. Share a room link and listen together.',
  );
