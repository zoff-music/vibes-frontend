import { Await, Link } from '@kasperrt/smolter/preact';
import type { PublicRoomV3 } from '@vibes/models';
import { PublicRoomTile } from '@vibes/ui/web';
import { useExperience } from '../../../hooks/useExperience';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: Promise<PublicRoomV3[] | null> | PublicRoomV3[] | null;
}

export function PublicRoomDiscovery({
  onJoinRoom,
  rooms,
}: PublicRoomDiscoveryProps) {
  const roomType = useExperience();
  const watch = roomType === 'WATCH';

  return (
    <section aria-labelledby="live-rooms-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="live-rooms-heading"
          className="flex shrink-0 items-center gap-2 font-pixel text-sm text-theme-muted normal-case tracking-normal"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-secondary"
          />
          Live rooms
        </h2>
        <Link
          prefetch="intent"
          to={
            watch
              ? '/rooms/explore?live=false&type=watch'
              : '/rooms/explore?live=false'
          }
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-cyan-800 text-sm transition-colors hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:text-secondary"
        >
          Browse all public <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="min-h-20">
        <Await
          resolve={rooms}
          fallback={
            <p className="text-sm text-theme-muted">Loading live rooms…</p>
          }
          errorElement={<RoomList rooms={null} onJoinRoom={onJoinRoom} />}
        >
          {(result: PublicRoomV3[] | null) => (
            <RoomList rooms={result} onJoinRoom={onJoinRoom} />
          )}
        </Await>
      </div>
    </section>
  );
}

interface RoomListProps {
  rooms: PublicRoomV3[] | null;
  onJoinRoom: (roomId: string) => void;
}

function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  const roomType = useExperience();
  const visibleRooms = rooms?.filter(
    (room) => room.roomType === roomType && room.playlistItemCount > 0,
  );

  return (
    <div className="flex flex-wrap gap-2">
      {visibleRooms?.map((room) => (
        <div
          key={room.id}
          className="min-w-0 grow basis-full sm:basis-[calc((100%-1rem)/3)]"
        >
          <PublicRoomTile room={room} onJoin={onJoinRoom} />
        </div>
      ))}
      {visibleRooms?.length === 0 && (
        <p className="w-full text-sm text-theme-muted">
          No rooms are live right now. Browse public rooms or start your own.
        </p>
      )}
      {rooms === null && (
        <p className="w-full text-sm text-theme-muted">
          Live rooms are temporarily unavailable.
        </p>
      )}
    </div>
  );
}
