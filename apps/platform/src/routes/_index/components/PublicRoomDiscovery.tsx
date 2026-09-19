import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { PublicRoomTile } from '@vibes/ui/web';
import { Link } from 'react-router';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: PublicRoom[];
}

export function PublicRoomDiscovery({
  onJoinRoom,
  rooms,
}: PublicRoomDiscoveryProps) {
  return (
    <section aria-labelledby="live-rooms-heading" className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="live-rooms-heading"
          className="flex items-center gap-2 font-pixel text-sm text-theme-muted normal-case tracking-normal"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-secondary"
          />
          Live rooms
        </h2>
        <Link
          to="/explore/rooms"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-theme bg-theme-surface px-4 text-sm text-theme transition-colors hover:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Browse public rooms <span aria-hidden="true">→</span>
        </Link>
      </div>
      {rooms.length === 0 && (
        <p className="text-sm text-theme-muted">
          Find a public queue and start listening.
        </p>
      )}

      <div
        className={classNames(
          'grid gap-2',
          rooms.length === 2 && 'sm:grid-cols-2',
          rooms.length >= 3 && 'sm:grid-cols-3',
        )}
      >
        {rooms.map((room) => (
          <PublicRoomTile key={room.id} room={room} onJoin={onJoinRoom} />
        ))}
      </div>
    </section>
  );
}
