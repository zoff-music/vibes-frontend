import type { AdminRoomResultV2, AdminRoomSummaryV2 } from '@vibes/models';
import type { AdminRoomSearch } from '../loader';

export function selectRoomPage(
  rooms: AdminRoomSummaryV2[],
  search: AdminRoomSearch,
): AdminRoomResultV2 {
  const query = search.q.toLowerCase();
  const matchingRooms = query
    ? rooms.filter(
        (room) =>
          room.id.toLowerCase().includes(query) ||
          room.name.toLowerCase().includes(query),
      )
    : [...rooms];
  matchingRooms.sort((left, right) => {
    const leftValue =
      search.sortBy === 'playlistItems'
        ? left.playlistItemCount
        : left.userCount;
    const rightValue =
      search.sortBy === 'playlistItems'
        ? right.playlistItemCount
        : right.userCount;
    const difference = leftValue - rightValue;

    return search.order === 'asc' ? difference : -difference;
  });
  const page = matchingRooms.slice(search.from, search.to + 1);

  return {
    count: page.length,
    from: search.from,
    rooms: page,
    to: page.length > 0 ? search.from + page.length - 1 : search.from,
    total: matchingRooms.length,
  };
}
