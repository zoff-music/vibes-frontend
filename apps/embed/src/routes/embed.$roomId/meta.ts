import type { MetaFunction } from 'react-router';
import { robotsDirectives } from '../../robots';
import type { embedRoomLoader } from './loader';

export const embedRoomMeta: MetaFunction<typeof embedRoomLoader> = ({
  loaderData,
}) => {
  const roomName = loaderData?.room.name || loaderData?.roomId;
  const roomDescription =
    loaderData?.room.roomType === 'WATCH'
      ? 'Embedded Watch Room'
      : 'Embedded Music Room';
  const title = roomName
    ? `${roomName} | ${roomDescription} | Zoff`
    : `${roomDescription} | Zoff`;

  return [
    { title },
    { name: 'robots', content: robotsDirectives },
    { name: 'googlebot', content: robotsDirectives },
    { name: 'bingbot', content: robotsDirectives },
  ];
};
