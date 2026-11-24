import { useFetcher } from '@kasperrt/smolter/preact';
import {
  ArrowRightIcon,
  LinkButton,
  PublicRoomTile,
  SegmentedControl,
} from '@vibes/ui/web';
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
    rooms ?? (recent ? history.map((room) => ({ ...room, roomType })) : []);

  const recentEmptyMessage = history.length
    ? 'Your recent rooms are no longer available. Join a room to add it here.'
    : `Join a ${roomType === 'WATCH' ? 'Watch' : 'Music'} room to see it here.`;

  return (
    <section aria-label="Rooms" className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
            saveRoomDiscoveryTab(value, roomType);
            void fetcher.load(`/resources/rooms?tab=${value}&type=${roomType}`);
          }}
        />
        <LinkButton
          prefetch="intent"
          to={
            roomType === 'WATCH'
              ? '/rooms/explore?live=false&type=watch'
              : '/rooms/explore?live=false'
          }
          variant="ghost"
          size="small"
          className="group min-h-11 gap-2"
        >
          Browse all public rooms
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </LinkButton>
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
              ? recentEmptyMessage
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
    </section>
  );
}
