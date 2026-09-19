import type { PublicRoomResult } from '@vibes/models';
import { Link } from 'react-router';
import {
  publicRoomPageSize,
  type RoomBrowserSearch,
  roomBrowserUrl,
} from '../search';

interface RoomBrowserPaginationProps {
  result: PublicRoomResult;
  search: RoomBrowserSearch;
}

const pageLinkClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-theme bg-theme-surface px-5 py-2 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme';

export function RoomBrowserPagination({
  result,
  search,
}: RoomBrowserPaginationProps) {
  const hasPrevious = search.from > 0;
  const hasNext = result.to + 1 < result.total;
  const pages = Math.ceil(result.total / publicRoomPageSize);
  if (pages < 2) return null;

  return (
    <nav
      aria-label="Public room pages"
      className="mt-7 flex items-center justify-between gap-3 border-theme border-t pt-6"
    >
      {hasPrevious && (
        <Link
          to={roomBrowserUrl({
            ...search,
            from: Math.max(0, search.from - publicRoomPageSize),
          })}
          className={pageLinkClassName}
          preventScrollReset
          rel="prev"
        >
          Previous
        </Link>
      )}
      {!hasPrevious && (
        <span className="px-5 py-2 text-sm text-theme-subtle">Previous</span>
      )}
      <span className="text-center text-theme-muted text-xs">
        Page {Math.floor(search.from / publicRoomPageSize) + 1} of {pages}
      </span>
      {hasNext && (
        <Link
          to={roomBrowserUrl({
            ...search,
            from: search.from + publicRoomPageSize,
          })}
          className={pageLinkClassName}
          preventScrollReset
          rel="next"
        >
          Next
        </Link>
      )}
      {!hasNext && (
        <span className="px-5 py-2 text-sm text-theme-subtle">Next</span>
      )}
    </nav>
  );
}
