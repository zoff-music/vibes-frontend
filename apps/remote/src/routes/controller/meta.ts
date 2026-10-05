import type { MetaFunction } from 'react-router';
import type { ControllerLoaderData } from './loadController';

export const controllerMeta: MetaFunction<() => ControllerLoaderData> = ({
  loaderData,
  error,
}) => {
  let title = 'Remote Control | Zoff';

  if (loaderData?.room) {
    title = `${loaderData.room.name} | Remote Control | Zoff`;
  }

  if (error || loaderData?.error) {
    title = 'Remote Unavailable | Zoff';
  }

  return [{ title }, { name: 'robots', content: 'noindex, nofollow' }];
};
