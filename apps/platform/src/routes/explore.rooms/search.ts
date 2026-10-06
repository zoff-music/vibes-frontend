import type { PublicRoomResultV3, RoomType } from '@vibes/models';
import { PUBLIC_ROOM_PAGE_SIZE } from '@vibes/shared';

export const publicRoomPageSize = PUBLIC_ROOM_PAGE_SIZE;

export interface RoomBrowserSearch {
  roomType: RoomType;
  q: string;
  live: boolean;
  from: number;
}

export interface RoomBrowserLoaderData {
  result: PublicRoomResultV3 | null;
  search: RoomBrowserSearch;
}

export function readRoomBrowserSearch(request: Request): RoomBrowserSearch {
  const url = new URL(request.url);
  const parsedFrom = Number(url.searchParams.get('from') ?? '0');
  const validFrom =
    Number.isSafeInteger(parsedFrom) &&
    parsedFrom >= 0 &&
    parsedFrom <= 2_147_483_638;

  return {
    roomType: url.searchParams.get('type') === 'watch' ? 'WATCH' : 'MUSIC',
    q: (url.searchParams.get('q') ?? '').trim().slice(0, 100),
    live: url.searchParams.get('live') !== 'false',
    from: validFrom
      ? Math.floor(parsedFrom / publicRoomPageSize) * publicRoomPageSize
      : 0,
  };
}

export function roomBrowserRedirect(
  result: PublicRoomResultV3,
  search: RoomBrowserSearch,
): string | null {
  if (search.from === 0 || search.from < result.total) return null;
  const lastPage = Math.max(
    0,
    Math.ceil(result.total / publicRoomPageSize) - 1,
  );
  return roomBrowserUrl({ ...search, from: lastPage * publicRoomPageSize });
}

export function roomBrowserUrl({ q, live, from, roomType }: RoomBrowserSearch) {
  const params = new URLSearchParams();
  if (roomType === 'WATCH') params.set('type', 'watch');
  if (q) params.set('q', q);
  if (!live) params.set('live', 'false');
  if (from > 0) params.set('from', String(from));
  const query = params.toString();
  return query ? `/rooms/explore?${query}` : '/rooms/explore';
}
