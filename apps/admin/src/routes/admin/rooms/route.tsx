import { showRateLimitMessageToast, useAdminEvents } from '@vibes/api';
import { Button } from '@vibes/ui';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
} from 'react-router';
import { AdminRoomFilters } from '../components/AdminRoomFilters';
import type { AdminRoomsActionData } from './action';
import { action } from './action';
import { AdminRoomCard } from './components/AdminRoomCard';
import type { AdminRoomSearch, AdminRoomsLoaderData } from './loader';
import { loader } from './loader';

export { action, loader };

export default function AdminRooms() {
  const { roomResult, roomSearch } = useLoaderData<AdminRoomsLoaderData>();
  const fetcher = useFetcher<AdminRoomsActionData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const isLoading = fetcher.state !== 'idle' || navigation.state !== 'idle';
  const rooms = roomResult.rooms;
  const hasRooms = rooms.length > 0;
  const totalViewers = useMemo(
    () => rooms.reduce((total, room) => total + room.userCount, 0),
    [rooms],
  );

  useAdminEvents({
    enabled: true,
    onRoomsUpdate: revalidator.revalidate,
  });

  useEffect(() => {
    if (fetcher.data?.rateLimitMessage) {
      showRateLimitMessageToast(fetcher.data.rateLimitMessage);
    }
    if (fetcher.data?.success) {
      setEditingRoomId(null);
      setEditingName('');
    }
  }, [fetcher.data]);

  const loadRoomPage = (next: AdminRoomSearch) => {
    const params = new URLSearchParams({
      sortBy: next.sortBy,
      order: next.order,
      from: String(next.from),
      to: String(next.to),
    });
    if (next.q) {
      params.set('q', next.q);
    }

    navigate(`/admin/rooms?${params.toString()}`);
  };

  const refreshRooms = () => {
    revalidator.revalidate();
  };

  const handleStartRename = (event: MouseEvent<HTMLButtonElement>) => {
    const room = rooms.find((item) => item.id === event.currentTarget.value);
    if (!room) {
      return;
    }

    setEditingRoomId(room.id);
    setEditingName(room.name);
  };

  const cancelRename = () => {
    setEditingRoomId(null);
    setEditingName('');
  };

  const handleEditingNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditingName(event.target.value);
  };

  const saveRename = () => {
    const name = editingName.trim();
    if (!editingRoomId || !name || isLoading) {
      return;
    }

    fetcher.submit(
      {
        intent: 'renameRoom',
        roomId: editingRoomId,
        name,
      },
      { method: 'post' },
    );
  };

  const handleEditingNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      saveRename();
    }
  };

  const handleClearPassword = (event: MouseEvent<HTMLButtonElement>) => {
    const room = rooms.find((item) => item.id === event.currentTarget.value);
    if (!room?.hasAdminPassword || isLoading) {
      return;
    }

    fetcher.submit(
      {
        intent: 'clearPassword',
        roomId: room.id,
      },
      { method: 'post' },
    );
  };

  const handleDeleteRoom = (event: MouseEvent<HTMLButtonElement>) => {
    const room = rooms.find((item) => item.id === event.currentTarget.value);
    if (!room || isLoading) {
      return;
    }

    const confirmed = window.confirm(`Delete room "${room.name}"?`);
    if (!confirmed) {
      return;
    }

    fetcher.submit(
      {
        intent: 'deleteRoom',
        roomId: room.id,
      },
      { method: 'post' },
    );
  };

  const searchRooms = (query: string) => {
    loadRoomPage({
      ...roomSearch,
      q: query,
      from: 0,
      to: roomSearch.pageSize - 1,
    });
  };

  const sortRooms = (
    sortBy: AdminRoomSearch['sortBy'],
    order: AdminRoomSearch['order'],
  ) => {
    loadRoomPage({
      ...roomSearch,
      sortBy,
      order,
      from: 0,
      to: roomSearch.pageSize - 1,
    });
  };

  const loadPreviousRooms = () => {
    const from = Math.max(0, roomSearch.from - roomSearch.pageSize);
    loadRoomPage({
      ...roomSearch,
      from,
      to: from + roomSearch.pageSize - 1,
    });
  };

  const loadNextRooms = () => {
    const from = roomSearch.from + roomSearch.pageSize;
    loadRoomPage({
      ...roomSearch,
      from,
      to: from + roomSearch.pageSize - 1,
    });
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-black text-3xl tracking-tight">Rooms</h1>
          <p className="text-ink/60 text-sm dark:text-gray-400">
            {hasRooms
              ? `${roomResult.total} rooms, ${totalViewers} listeners on this page`
              : roomSearch.q
                ? 'No rooms match this search'
                : 'No active rooms yet'}
          </p>
        </div>
        <Button onClick={refreshRooms} variant="tertiary">
          Refresh
        </Button>
      </header>

      {fetcher.data?.error && !fetcher.data.rateLimitMessage && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 text-sm">
          {fetcher.data.error}
        </p>
      )}

      <AdminRoomFilters
        disabled={isLoading}
        onSearch={searchRooms}
        onSort={sortRooms}
        search={roomSearch}
      />

      <div className="grid gap-4">
        {rooms.map((room) => (
          <AdminRoomCard
            editingName={editingName}
            editingRoomId={editingRoomId}
            isLoading={isLoading}
            key={room.id}
            onCancelRename={cancelRename}
            onClearPassword={handleClearPassword}
            onDelete={handleDeleteRoom}
            onEditingNameChange={handleEditingNameChange}
            onEditingNameKeyDown={handleEditingNameKeyDown}
            onSaveRename={saveRename}
            onStartRename={handleStartRename}
            room={room}
          />
        ))}
      </div>

      <nav
        aria-label="Room pagination"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-ink/60 text-sm dark:text-gray-400">
          {roomResult.total === 0
            ? 'No rooms'
            : `${roomResult.from + 1}–${roomResult.to + 1} of ${roomResult.total}`}
        </p>
        <div className="flex gap-3">
          <Button
            disabled={roomSearch.from === 0 || isLoading}
            onClick={loadPreviousRooms}
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={roomResult.to + 1 >= roomResult.total || isLoading}
            onClick={loadNextRooms}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </nav>
    </main>
  );
}
