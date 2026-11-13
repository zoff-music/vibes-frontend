import { useFetcher } from '@kasperrt/smolter/preact';
import { PublicRoomTile } from '@vibes/ui/web';
import { useEffect } from 'preact/compat';
import type { RecentRoom } from '../../../utils/recentRooms';
import type { clientLoader } from '../../resources.recents/clientLoader';

interface RecentRoomsProps {
  rooms: RecentRoom[];
}

export function RecentRooms({ rooms }: RecentRoomsProps) {
  const { data, error, load } = useFetcher<typeof clientLoader>();
  const roomIds = rooms.map((room) => room.id).join(',');
  useEffect(() => {
    if (!roomIds) return;
    const refresh = () => {
      if (document.visibilityState === 'visible')
        void load('/resources/recents?view=history');
    };
    refresh();
    const interval = window.setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [roomIds, load]);

  if (!rooms.length) return null;
  const details = data && 'rooms' in data ? data.rooms : undefined;
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
          <PublicRoomTile
            key={room.id}
            room={
              details?.find((item) => item.id === room.id) ?? {
                ...room,
                roomType: 'MUSIC',
              }
            }
            detailsPlaceholder={
              details || error
                ? 'Room details unavailable'
                : 'Loading room details…'
            }
          />
        ))}
      </div>
    </section>
  );
}
