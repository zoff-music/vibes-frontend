import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
} from '@kasperrt/smolter/preact';
import { useAdminEvents } from '@vibes/api';
import type { AdminRoomSummaryV2 } from '@vibes/models';
import { showRateLimitMessageToast } from '@vibes/shared';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'preact/compat';
import type { AdminRoomsActionData } from '../action';
import type { AdminRoomSearch, AdminRoomsLoaderData } from '../loader';
import { selectRoomPage } from '../utils/selectRoomPage';

export function useAdminRooms() {
  const { roomResult, roomSearch } = useLoaderData<AdminRoomsLoaderData>();
  const fetcher = useFetcher<AdminRoomsActionData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [liveRooms, setLiveRooms] = useState<AdminRoomSummaryV2[] | null>(null);
  const [streamRevision, setStreamRevision] = useState(0);
  const liveRoomResult = useMemo(
    () =>
      liveRooms === null ? roomResult : selectRoomPage(liveRooms, roomSearch),
    [liveRooms, roomResult, roomSearch],
  );
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const isLoading = fetcher.state !== 'idle' || navigation.state !== 'idle';
  const rooms = liveRoomResult.rooms;
  const hasRooms = rooms.length > 0;
  const totalViewers = useMemo(
    () => rooms.reduce((total, room) => total + room.userCount, 0),
    [rooms],
  );

  useAdminEvents({
    enabled: true,
    revision: streamRevision,
    onRoomsUpdate: (updatedRooms) => {
      setLiveRooms(updatedRooms);
    },
    onRoomUpdate: (updatedRoom) => {
      setLiveRooms((current) => {
        if (current === null) return current;

        return [
          ...current.filter((room) => room.id !== updatedRoom.id),
          updatedRoom,
        ];
      });
    },
    onRoomRemoved: (roomId) => {
      setLiveRooms(
        (current) => current?.filter((room) => room.id !== roomId) ?? null,
      );
    },
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
      flagged: String(next.flagged),
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
    setStreamRevision((revision) => revision + 1);
    revalidator();
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
    setEditingName(event.currentTarget.value);
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

  const handleFlagRoom = (event: MouseEvent<HTMLButtonElement>) => {
    const room = rooms.find((item) => item.id === event.currentTarget.value);

    if (!room || isLoading) return;

    fetcher.submit(
      { intent: room.flagged ? 'unflagRoom' : 'flagRoom', roomId: room.id },
      { method: 'post' },
    );
  };

  const filterFlaggedRooms = () => {
    loadRoomPage({
      ...roomSearch,
      flagged: !roomSearch.flagged,
      from: 0,
      to: roomSearch.pageSize - 1,
    });
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
  return {
    roomSearch,
    fetcher,
    liveRoomResult,
    editingRoomId,
    editingName,
    isLoading,
    rooms,
    hasRooms,
    totalViewers,
    refreshRooms,
    handleStartRename,
    cancelRename,
    handleEditingNameChange,
    saveRename,
    handleEditingNameKeyDown,
    handleClearPassword,
    handleDeleteRoom,
    handleFlagRoom,
    filterFlaggedRooms,
    searchRooms,
    sortRooms,
    loadPreviousRooms,
    loadNextRooms,
  };
}
