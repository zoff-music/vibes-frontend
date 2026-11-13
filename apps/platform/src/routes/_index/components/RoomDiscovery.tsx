import { Link, useFetcher } from '@kasperrt/smolter/preact';
import { PublicRoomTile, SegmentedControl } from '@vibes/ui/web';
import { useState } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import {
  type RoomDiscoveryData,
  saveRoomDiscoveryTab,
} from '../../../utils/roomDiscovery';
import type { clientLoader } from '../../resources.rooms/clientLoader';

interface RoomDiscoveryProps {
  initial: RoomDiscoveryData;
  onJoinRoom: (roomId: string) => void;
}

export function RoomDiscovery({ initial, onJoinRoom }: RoomDiscoveryProps) {
  const roomType = useExperience();
  const [selected, setSelected] = useState(initial.tab);
  const fetcher = useFetcher<typeof clientLoader>();
  const data = fetcher.data?.tab === selected ? fetcher.data : initial;
  const recent = selected === 'recent';
  const rooms = recent ? data.recentRooms : data.publicRooms;
  const history = data.history;
  const unavailable = rooms === null;
  const visibleRooms =
    rooms ??
    (recent
      ? history.map((room) => ({ ...room, roomType: 'MUSIC' as const }))
      : []);

  return (
    <section aria-label="Rooms" className="mt-6">
      <div className="mb-3 sm:w-fit">
        {initial.history.length > 0 && (
          <SegmentedControl
            label="Rooms to show"
            value={selected}
            options={[
              { value: 'public', label: 'Public rooms' },
              { value: 'recent', label: 'Recent rooms' },
            ]}
            onChange={(value) => {
              if (value !== 'public' && value !== 'recent') return;
              if (value === selected) return;
              setSelected(value);
              saveRoomDiscoveryTab(value);
              void fetcher.load(
                `/resources/rooms?tab=${value}&type=${roomType}`,
              );
            }}
          />
        )}
        {initial.history.length === 0 && (
          <h2 className="font-pixel text-theme-muted text-sm tracking-normal normal-case">
            Public rooms
          </h2>
        )}
      </div>
      <section
        aria-label={recent ? 'Recent rooms' : 'Public rooms'}
        aria-busy={fetcher.state !== 'idle'}
        className="min-h-20"
      >
        <div className="flex flex-wrap gap-2">
          {visibleRooms.map((room) => (
            <div
              key={room.id}
              className="min-w-0 grow basis-full sm:basis-[calc((100%-1rem)/3)]"
            >
              <PublicRoomTile
                room={room}
                onJoin={onJoinRoom}
                detailsPlaceholder="Room details unavailable"
              />
            </div>
          ))}
        </div>
        {visibleRooms.length === 0 && !unavailable && (
          <p className="text-theme-muted text-sm">
            {recent
              ? 'Your recent rooms are no longer available. Join a room to add it here.'
              : 'No public rooms are live right now. Browse all rooms or start your own.'}
          </p>
        )}
        {visibleRooms.length === 0 && unavailable && (
          <p className="text-theme-muted text-sm">
            {recent
              ? 'Recent rooms are temporarily unavailable.'
              : 'Public rooms are temporarily unavailable.'}
          </p>
        )}
        {fetcher.error && (
          <p role="status" className="text-theme-muted mt-2 text-sm">
            Could not refresh rooms. Showing the last loaded details.
          </p>
        )}
      </section>
      {!recent && (
        <Link
          prefetch="intent"
          to={
            roomType === 'WATCH'
              ? '/rooms/explore?live=false&type=watch'
              : '/rooms/explore?live=false'
          }
          className="hover:bg-theme-surface focus-visible:ring-secondary dark:text-secondary mt-3 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm text-cyan-800 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Browse all public <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
