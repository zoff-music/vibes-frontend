import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import type { MouseEvent } from 'react';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: PublicRoom[] | null;
  loading: boolean;
}

export function PublicRoomDiscovery({
  onJoinRoom,
  rooms,
  loading,
}: PublicRoomDiscoveryProps) {
  const handleJoinRoom = (event: MouseEvent<HTMLButtonElement>) => {
    onJoinRoom(event.currentTarget.value);
  };

  return (
    <section
      aria-labelledby="live-rooms-heading"
      aria-busy={loading}
      className="mt-6"
    >
      <h2
        id="live-rooms-heading"
        className="mb-3 flex items-center gap-2 font-pixel text-sm text-theme-muted normal-case tracking-normal"
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-secondary"
        />
        Live rooms
      </h2>

      <div
        className={classNames(
          'grid min-h-52 content-start gap-2 sm:min-h-16',
          rooms?.length === 2 && 'sm:grid-cols-2',
          (loading || (rooms && rooms.length >= 3)) && 'sm:grid-cols-3',
        )}
      >
        {loading &&
          [0, 1, 2].map((placeholder) => (
            <div
              key={placeholder}
              aria-hidden="true"
              className="flex h-16 flex-col justify-center gap-2 rounded-2xl border border-theme bg-theme-surface px-4"
            >
              <div className="h-3 w-20 rounded bg-theme-hover" />
              <div className="h-2 w-36 rounded bg-theme-hover" />
            </div>
          ))}
        {!loading && (!rooms || rooms.length === 0) && (
          <p className="flex min-h-16 items-center rounded-2xl border border-theme bg-theme-surface px-4 py-3 text-sm text-theme-muted">
            {rooms
              ? 'No public rooms are playing right now. Start one above.'
              : 'Public rooms couldn’t be loaded. You can still join by name.'}
          </p>
        )}
        {rooms?.map((room) => (
          <Button
            key={room.id}
            onClick={handleJoinRoom}
            size="none"
            variant="tertiary"
            contentAlignment="between"
            value={room.id}
            className="group min-h-16 w-full gap-3 rounded-2xl px-4 py-3 shadow-sm transition-colors hover:bg-theme-hover"
          >
            <span className="flex w-full items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-pixel text-sm text-theme">
                  {room.name}
                </span>
                <span className="mt-1 block text-theme-muted text-xs">
                  {room.listenerCount} listening · {room.songCount}{' '}
                  {room.songCount === 1 ? 'song' : 'songs'}
                </span>
              </span>
              <span className="shrink-0 font-pixel text-secondary text-xs">
                Join →
              </span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
