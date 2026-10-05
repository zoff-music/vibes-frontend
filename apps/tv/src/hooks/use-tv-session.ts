import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  PublicRoomV3,
  RoomV2,
} from '@vibes/models';
import { useFetcher, useLoaderData } from '@vibes/native-router';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { useTvRoomEvents } from '@/hooks/use-tv-room-events';
import { subscribeToAppResume } from '@/lib/app-resume';
import { applyRoomSnapshot } from '@/lib/apply-room-snapshot';
import type { DiscoveryData } from '@/routes/_index/loader';
import type { CreateRoomData } from '@/routes/rooms.create/action';

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface TvSessionActions {
  createRoom: (name: string) => Promise<void>;
  generateRoom: (prompt: string) => Promise<void>;
  leaveRoom: () => void;
  loadRoom: (roomId: string) => Promise<RoomJoinResult>;
}

export interface TvSessionState {
  error: string;
  hydrating: boolean;
  listenerCount: number;
  loading: boolean;
  playback: PlaybackStateV2;
  providers: Providers;
  publicRooms: PublicRoomV3[];
  room: RoomV2 | null;
  roomId: string;
  playlistItems: PlaylistItem[];
}

export function useTvSession(): readonly [TvSessionState, TvSessionActions] {
  const discovery = useLoaderData<DiscoveryData>();
  const [, roomFetcher] = useFetcher<RoomSnapshot>({ routeId: 'rooms.$id' });
  const [createFetcherState, createFetcher] = useFetcher<CreateRoomData>({
    routeId: 'rooms.create',
  });
  const submitCreate = createFetcher.submit;
  const room = useRoomStore((state) => state.room);
  const listenerCount = useRoomStore((state) => state.usersCount);
  const playlistItems = useQueueStore((state) => state.playlistItems);
  const currentPlaylistItem = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackStore((state) => state.positionMs);
  const serverTimeMs = usePlaybackStore((state) => state.serverTimeMs);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const playback = useMemo<PlaybackStateV2>(
    () => ({
      currentPlaylistItem,
      isPlaying,
      positionMs,
      serverTimeMs,
      updatedAt,
    }),
    [currentPlaylistItem, isPlaying, positionMs, serverTimeMs, updatedAt],
  );
  const [roomId, setRoomId] = useState('');
  const [requestError, setRequestError] = useState('');
  const [roomLoading, setRoomLoading] = useState(false);
  const roomRequest = useRef(0);
  const providers = discovery?.providers ?? [];
  const publicRooms = discovery?.publicRooms ?? [];

  useTvRoomEvents(roomId);

  const loadRoom = useCallback(
    async (nextRoomId: string): Promise<RoomJoinResult> => {
      const normalizedRoomId = nextRoomId.trim().toLowerCase();
      if (!normalizedRoomId) {
        setRequestError('Enter a room name.');
        return 'error';
      }
      const requestId = roomRequest.current + 1;
      roomRequest.current = requestId;
      setRoomLoading(true);
      const result = await roomFetcher.load({
        params: { id: normalizedRoomId },
      });
      if (requestId !== roomRequest.current) return 'error';
      setRoomLoading(false);
      if (result.error === roomNotFoundError) {
        setRequestError('That room does not exist yet.');
        return 'notFound';
      }
      if (result.error || !result.data) {
        setRequestError(result.error || 'Could not find that room.');
        return 'error';
      }
      applyRoomSnapshot(result.data);
      setRoomId(normalizedRoomId);
      setRequestError('');
      return 'joined';
    },
    [roomFetcher.load],
  );

  const refreshRoom = useCallback(async () => {
    if (!roomId) return;
    const result = await roomFetcher.load({ params: { id: roomId } });
    if (result.error || !result.data) {
      setRequestError(result.error || 'Could not refresh the room.');
      return;
    }
    applyRoomSnapshot(result.data);
    setRequestError('');
  }, [roomFetcher.load, roomId]);

  useEffect(
    () => subscribeToAppResume(() => void refreshRoom()),
    [refreshRoom],
  );

  const generateRoom = useCallback(
    async (prompt: string) => {
      const result = await submitCreate({ intent: 'generate', prompt });
      if (result.error || !result.data) {
        setRequestError(result.error || 'Could not generate the room.');
        return;
      }
      await loadRoom(result.data.roomId);
    },
    [loadRoom, submitCreate],
  );

  const createRoom = useCallback(
    async (name: string) => {
      const result = await submitCreate({ intent: 'create', name, providers });
      if (result.error || !result.data) {
        setRequestError(result.error || 'Could not create the room.');
        return;
      }
      await loadRoom(result.data.roomId);
    },
    [loadRoom, providers, submitCreate],
  );

  const leaveRoom = useCallback(() => {
    roomRequest.current += 1;
    setRoomId('');
    setRequestError('');
    useRoomStore.getState().reset();
    useQueueStore.getState().setPlaylistItems([]);
    usePlaybackStore.getState().resetPlaybackState(emptyPlaybackState);
  }, []);

  return [
    {
      error: requestError || discovery?.warning || '',
      hydrating: discovery === null,
      listenerCount,
      loading: roomLoading || createFetcherState.state === 'submitting',
      playback,
      providers,
      publicRooms,
      room,
      roomId,
      playlistItems,
    },
    { createRoom, generateRoom, leaveRoom, loadRoom },
  ];
}

const roomNotFoundError = 'ROOM_NOT_FOUND';
const emptyPlaybackState: PlaybackStateV2 = {
  currentPlaylistItem: null,
  isPlaying: false,
  positionMs: 0,
  serverTimeMs: 0,
  updatedAt: '',
};
