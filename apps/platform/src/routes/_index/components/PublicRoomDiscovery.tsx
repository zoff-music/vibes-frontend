import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import type { MouseEvent } from 'react';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: PublicRoom[];
}

export function PublicRoomDiscovery({
  onJoinRoom,
  rooms,
}: PublicRoomDiscoveryProps) {
  const handleJoinRoom = (event: MouseEvent<HTMLButtonElement>) => {
    onJoinRoom(event.currentTarget.value);
  };

  if (rooms.length === 0) return null;

  return (
    <section aria-labelledby="live-rooms-heading" className="mt-6">
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
          'grid gap-2',
          rooms.length === 2 && 'sm:grid-cols-2',
          rooms.length >= 3 && 'sm:grid-cols-3',
        )}
      >
        {rooms.map((room) => (
          <Button
            key={room.id}
            onClick={handleJoinRoom}
            size="none"
            variant="ghost"
            contentAlignment="between"
            value={room.id}
            className="group min-h-16 w-full gap-3 rounded-2xl border border-theme bg-theme-surface px-4 py-3 transition-colors hover:border-secondary/50 hover:bg-theme-hover"
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
