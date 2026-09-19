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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="live-rooms-heading"
          className="flex items-center gap-2 text-sm text-theme-muted"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Live rooms
        </h2>
        <Link
          to="/explore/rooms?live=false"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-theme transition-colors hover:bg-theme-surface hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Browse all public <span aria-hidden="true">→</span>
        </Link>
      </div>
      {rooms.length === 0 && (
        <p className="text-sm text-theme-muted">
          No rooms are live right now. Browse public rooms or start your own.
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
