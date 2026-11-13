import { Link } from '@kasperrt/smolter/preact';
import type { RecentRoom } from '../../../utils/recentRooms';

interface RecentRoomsProps {
  rooms: RecentRoom[];
}

export function RecentRooms({ rooms }: RecentRoomsProps) {
  if (!rooms.length) return null;

  return (
    <section aria-labelledby="recent-rooms-heading" className="mt-6">
      <h2
        id="recent-rooms-heading"
        className="font-pixel text-theme-muted mb-3 text-sm tracking-normal normal-case"
      >
        Recent rooms
      </h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {rooms.map((room) => (
          <Link
            key={room.id}
            to={`/${encodeURIComponent(room.id)}`}
            prefetch="intent"
            className="border-theme bg-theme-surface hover:border-theme-strong hover:bg-theme-hover focus-visible:ring-secondary focus-visible:ring-offset-theme flex min-h-14 min-w-0 items-center gap-3 rounded-3xl border px-5 py-4 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="font-pixel text-theme min-w-0 flex-1 truncate text-sm">
              {room.name}
            </span>
            <span className="font-pixel dark:text-secondary shrink-0 text-xs text-cyan-800">
              Join <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
