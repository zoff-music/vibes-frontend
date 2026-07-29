import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Button } from '@vibes/ui';
import { motion } from 'framer-motion';
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

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center">
        <span className="flex items-center gap-2 font-pixel text-3xs text-secondary tracking-label">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
          Live now
        </span>
      </div>

      <div
        className={classNames(
          'grid gap-2',
          rooms.length === 2 && 'sm:grid-cols-2',
          rooms.length >= 3 && 'sm:grid-cols-3',
        )}
      >
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: index * 0.05, duration: 0.18 }}
          >
            <Button
              onClick={handleJoinRoom}
              size="none"
              variant="ghost"
              value={room.id}
              className="group min-h-15 w-full justify-between gap-3 rounded-xl border border-theme bg-theme px-3 py-2.5 text-left transition-colors hover:border-secondary/50 hover:bg-theme-hover"
            >
              <span className="flex w-full items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-pixel text-theme text-xs">
                    {room.name}
                  </span>
                  <span className="mt-1 block text-3xs text-theme-muted">
                    {room.listenerCount} listening · {room.songCount}{' '}
                    {room.songCount === 1 ? 'song' : 'songs'}
                  </span>
                </span>
                <span className="shrink-0 font-pixel text-3xs text-secondary">
                  Join →
                </span>
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
