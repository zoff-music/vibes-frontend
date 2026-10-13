import type { PublicRoomV3 } from '@vibes/models';
import { PublicRoomTile } from '@vibes/ui/web';
import { Suspense } from 'react';
import { Await, Link } from 'react-router';
import { useExperience } from '../../../hooks/useExperience';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: Promise<PublicRoomV3[] | null>;
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
      <div className="h-56 sm:h-20">
        <Suspense fallback={<PublicRoomsPlaceholder />}>
          <Await
            resolve={rooms}
            errorElement={
              <p className="text-sm text-theme-muted">
                Live rooms are temporarily unavailable.
              </p>
            }
          >
            {(result: PublicRoomV3[] | null) => (
              <div className="grid h-full grid-rows-3 gap-2 sm:grid-cols-3 sm:grid-rows-1">
                {result
                  ?.filter((room) => room.roomType === roomType)
                  .map((room) => (
                    <PublicRoomTile
                      key={room.id}
                      room={room}
                      onJoin={onJoinRoom}
                    />
                  ))}
                {result?.length === 0 && (
                  <p className="text-sm text-theme-muted sm:col-span-3">
                    No rooms are live right now. Browse public rooms or start
                    your own.
                  </p>
                )}
                {result === null && (
                  <p className="text-sm text-theme-muted sm:col-span-3">
                    Live rooms are temporarily unavailable.
                  </p>
                )}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function PublicRoomsPlaceholder() {
  return (
    <div
      role="status"
      className="grid h-full grid-rows-3 gap-2 sm:grid-cols-3 sm:grid-rows-1"
    >
      <span className="sr-only">Loading live rooms</span>
      {[0, 1, 2].map((slot) => (
        <div
          key={slot}
          aria-hidden="true"
          className="rounded-2xl border border-theme bg-theme-surface motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}
