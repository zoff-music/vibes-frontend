import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api } from '@vibes/api';
import { readRecentRooms } from '../../utils/recentRooms';
import {
  type RoomDiscoveryData,
  selectRoomDiscoveryTab,
} from '../../utils/roomDiscovery';

export async function clientLoader({
  request,
  params,
}: ClientLoaderFunctionArgs): Promise<RoomDiscoveryData> {
  const search = new URL(request.url).searchParams;
  const selected = search.get('tab');
  const roomType =
    params.experience === 'watch' || search.get('type') === 'WATCH'
      ? 'WATCH'
      : 'MUSIC';
  const cookie = document.cookie;
  const history = readRecentRooms(cookie, roomType);
  const options = { retry: 0, signal: request.signal };
  const publicRequest =
    selected !== 'recent'
      ? api.v3
          .get(
            '/rooms/public',
            { $search: { live: true, from: 0, to: 2, roomType } },
            options,
          )
          .then(([error, result]) =>
            error
              ? null
              : result.rooms.filter(
                  (room) =>
                    room.roomType === roomType && room.playlistItemCount > 0,
                ),
          )
      : Promise.resolve(null);
  const recentRequest =
    selected !== 'public' && history.length
      ? api.v3
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
          .then(([error, result]) =>
            error
              ? null
              : result.rooms.filter((room) => room.roomType === roomType),
          )
      : Promise.resolve([]);
  const [publicRooms, recentRooms] = await Promise.all([
    publicRequest,
    recentRequest,
  ]);
  const tab =
    selected === 'public' || selected === 'recent'
      ? selected
      : selectRoomDiscoveryTab(
          cookie,
          history.length > 0,
          Boolean(publicRooms?.length),
          roomType,
        );
  return { tab, history, publicRooms, recentRooms };
}
