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
  pending: boolean;
}

const pageLinkClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-theme bg-theme-surface px-5 py-2 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme aria-disabled:cursor-wait aria-disabled:opacity-50';

export function RoomBrowserPagination({
  result,
  search,
  pending,
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
          aria-disabled={pending}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          Previous
        </Link>
      )}
      {!hasPrevious && (
        <span className="px-5 py-2 text-sm text-theme-subtle">Previous</span>
      )}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="relative min-w-24 text-center text-theme-muted text-xs"
      >
        <span className="block">
          Page {Math.floor(search.from / publicRoomPageSize) + 1} of {pages}
        </span>
        {pending && (
          <span className="absolute inset-x-0 top-full mt-2 flex items-center justify-center gap-2 whitespace-nowrap text-cyan-800 dark:text-secondary">
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            />
            Loading rooms…
          </span>
        )}
      </div>
      {hasNext && (
        <Link
          to={roomBrowserUrl({
            ...search,
            from: search.from + publicRoomPageSize,
          })}
          className={pageLinkClassName}
          preventScrollReset
          rel="next"
          aria-disabled={pending}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
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
