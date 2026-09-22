import type { PublicRoom } from '@vibes/models';
import { PublicRoomTile } from '@vibes/ui/web';
import { memo } from 'react';

interface RoomBrowserResultsProps {
  rooms: PublicRoom[];
  onJoin: (roomId: string) => void;
}

export const RoomBrowserResults = memo(function RoomBrowserResults({
  rooms,
  onJoin,
}: RoomBrowserResultsProps) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <li key={room.id} className="min-w-0">
          <PublicRoomTile room={room} onJoin={onJoin} />
        </li>
      ))}
    </ul>
  );
});
