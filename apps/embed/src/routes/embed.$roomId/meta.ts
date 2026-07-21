import type { MetaFunction } from 'react-router';
import { robotsDirectives } from '../../robots';
import type { embedRoomLoader } from './loader';

export const embedRoomMeta: MetaFunction<typeof embedRoomLoader> = ({
  loaderData,
}) => {
  const roomName = loaderData?.room.name || loaderData?.roomId;
  const title = roomName ? `${roomName} | Zoff` : 'Zoff embedded room';

  return [
    { title },
    { name: 'robots', content: robotsDirectives },
    { name: 'googlebot', content: robotsDirectives },
    { name: 'bingbot', content: robotsDirectives },
  ];
};
