import type { PublicRoom } from '@vibes/models';
import { classNames, PUBLIC_ROOM_PAGE_SIZE } from '@vibes/shared';
import { Button, PublicRoomTile, SegmentedControl } from '@vibes/ui/web';
import { useState } from 'react';
import { Link, useFetcher } from 'react-router';
import type { RoomBrowserLoaderData } from '../../explore.rooms/search';

interface PublicRoomDiscoveryProps {
  onJoinRoom: (roomId: string) => void;
  rooms: PublicRoom[];
}

export function PublicRoomDiscovery({
  onJoinRoom,
  rooms,
}: PublicRoomDiscoveryProps) {
  const [mode, setMode] = useState('live');
  const [query, setQuery] = useState('');
  const fetcher = useFetcher<RoomBrowserLoaderData>();
  const result = fetcher.data?.result;
  const shownRooms = mode === 'live' ? rooms : (result?.rooms ?? []);
  const load = (from = 0) => {
    void fetcher.load(
      `/explore/rooms?live=false&from=${from}&q=${encodeURIComponent(query)}`,
    );
  };
  return (
    <section aria-labelledby="live-rooms-heading" className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <h2 id="live-rooms-heading" className="sr-only">
            Find a room
          </h2>
          <SegmentedControl
            label="Public rooms"
            value={mode}
            options={[
              { value: 'live', label: 'Live rooms' },
              { value: 'public', label: 'All public' },
            ]}
            onChange={(next) => {
              setMode(next);
              if (next === 'public') load();
            }}
          />
        </div>
        <Link
          to="/explore/rooms"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-theme bg-theme-surface px-4 text-sm text-theme transition-colors hover:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Browse public rooms <span aria-hidden="true">→</span>
        </Link>
      </div>
      {mode === 'public' && (
        <form
          className="mb-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <input
            aria-label="Search public rooms by name"
            placeholder="Search rooms by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            className="min-w-0 flex-1 rounded-xl border border-theme bg-theme-surface px-4 text-theme focus:outline-secondary"
          />
          <Button type="submit" variant="tertiary">
            Search
          </Button>
        </form>
      )}
      {fetcher.state !== 'idle' && (
        <p role="status" className="mb-3 text-sm text-theme-muted">
          Loading rooms…
        </p>
      )}
      {mode === 'public' && fetcher.data && !result && (
        <p role="status">Rooms could not be loaded. Try again.</p>
      )}
      {shownRooms.length === 0 && (
        <p className="text-sm text-theme-muted">
          Find a public queue and start listening.
        </p>
      )}

      <div
        className={classNames(
          'grid gap-2',
          shownRooms.length === 2 && 'sm:grid-cols-2',
          shownRooms.length >= 3 && 'sm:grid-cols-3',
        )}
      >
        {shownRooms.map((room) => (
          <PublicRoomTile key={room.id} room={room} onJoin={onJoinRoom} />
        ))}
      </div>
      {mode === 'public' && result && result.total > PUBLIC_ROOM_PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="tertiary"
            disabled={fetcher.state !== 'idle' || result.from === 0}
            onClick={() =>
              load(Math.max(0, result.from - PUBLIC_ROOM_PAGE_SIZE))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-theme-muted">
            {Math.floor(result.from / PUBLIC_ROOM_PAGE_SIZE) + 1} /{' '}
            {Math.ceil(result.total / PUBLIC_ROOM_PAGE_SIZE)}
          </span>
          <Button
            variant="tertiary"
            disabled={fetcher.state !== 'idle' || result.to + 1 >= result.total}
            onClick={() => load(result.from + PUBLIC_ROOM_PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
