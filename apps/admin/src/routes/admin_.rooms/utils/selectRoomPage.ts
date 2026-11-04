import type { AdminRoomResultV2, AdminRoomSummaryV2 } from '@vibes/models';
import type { AdminRoomSearch } from '../loader';

export function selectRoomPage(
  rooms: AdminRoomSummaryV2[],
  search: AdminRoomSearch,
): AdminRoomResultV2 {
  const query = search.q.toLowerCase();
  const visibleRooms = rooms.filter((room) => !search.flagged || room.flagged);
  const matchingRooms = query
    ? visibleRooms.filter(
        (room) =>
          room.id.toLowerCase().includes(query) ||
          room.name.toLowerCase().includes(query),
      )
    : visibleRooms;
  matchingRooms.sort((left, right) => {
    const leftPrimaryValue =
      search.sortBy === 'playlistItems'
        ? left.playlistItemCount
        : left.userCount;
    const rightPrimaryValue =
      search.sortBy === 'playlistItems'
        ? right.playlistItemCount
        : right.userCount;
    const primaryDifference = leftPrimaryValue - rightPrimaryValue;

    if (primaryDifference !== 0) {
      return search.order === 'asc' ? primaryDifference : -primaryDifference;
    }

    const secondaryDifference =
      search.sortBy === 'playlistItems'
        ? left.userCount - right.userCount
        : left.playlistItemCount - right.playlistItemCount;

    if (secondaryDifference !== 0) {
      return search.order === 'asc'
        ? secondaryDifference
        : -secondaryDifference;
    }

    const nameDifference = compareText(left.name, right.name);

    return nameDifference !== 0
      ? nameDifference
      : compareText(left.id, right.id);
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

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
