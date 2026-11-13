import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createPublicRequestCache } from '@vibes/api';
import type { PublicRoomV3 } from '@vibes/models';
import { getServerApiV3 } from '../../http.server';
import { readRecentRooms } from '../../utils/recentRooms';
import {
  type RoomDiscoveryData,
  selectRoomDiscoveryTab,
} from '../../utils/roomDiscovery';

const readPublicRooms = createPublicRequestCache<PublicRoomV3[]>(10_000);

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<RoomDiscoveryData> {
  const api = getServerApiV3(request);
  const cookie = request.headers.get('cookie') ?? '';
  const history = readRecentRooms(cookie);
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const options = { retry: 0, signal: request.signal };
  const apiOrigin =
    process.env.VITE_API_URL_INTERNAL || new URL(request.url).origin;
  const publicRequest = readPublicRooms(
    `${apiOrigin}:${roomType}`,
    async (signal) => {
      const [error, result] = await api.get(
        '/rooms/public',
        { $search: { live: true, from: 0, to: 2, roomType } },
        { retry: 0, signal },
      );
      if (error) return [error, null];
      return [
        null,
        result.rooms.filter(
          (room) => room.roomType === roomType && room.playlistItemCount > 0,
        ),
      ];
    },
    request.signal,
  ).then(([error, rooms]) => (error ? null : rooms));
  const recentRequest = history.length
    ? api
        .get(
          '/rooms',
          {
            $search: {
              ids: history.map((room) => room.id).join(','),
              from: 0,
              to: 2,
            },
          },
          options,
        )
        .then(([error, result]) => (error ? null : result.rooms))
    : Promise.resolve([]);
  const [publicRooms, recentRooms] = await Promise.all([
    publicRequest,
    recentRequest,
  ]);
  return {
    history,
    publicRooms,
    recentRooms,
    tab: selectRoomDiscoveryTab(
      cookie,
      history.length > 0,
      Boolean(publicRooms?.length),
    ),
  };
}
