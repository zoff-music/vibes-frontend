import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  PublicRoomV3,
  RoomType,
  RoomV2,
} from '@vibes/models';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useMutation, useRequest } from '@vibes/shared/use-request';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { roomNotFoundError } from '@/constants/room';
import { useTvRoomEvents } from '@/hooks/use-tv-room-events';
import { subscribeToAppResume } from '@/lib/app-resume';
import { applyRoomSnapshot } from '@/lib/apply-room-snapshot';
import type { DiscoveryData } from '@/requests/load-discovery';
import { loadDiscovery } from '@/requests/load-discovery';
import { loadRoom as loadRoomRequest } from '@/requests/load-room';
import { updateRoomCreation } from '@/requests/update-room-creation';

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface TvSessionActions {
  changeRoomType: (roomType: RoomType) => Promise<void>;
  createRoom: (name: string) => Promise<void>;
  generateRoom: (prompt: string) => Promise<void>;
  leaveRoom: () => void;
  loadRoom: (roomId: string) => Promise<RoomJoinResult>;
}

export interface TvSessionState {
  roomType: RoomType;
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
  const [discovery, setDiscovery] = useState<DiscoveryData | null>(null);
  const [initialError, setInitialError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [, discoveryFetcherLoad] = useRequest(loadDiscovery);
  const [roomType, setRoomType] = useState<RoomType>('MUSIC');
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<DiscoveryData | null>(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const discoveryRequest = useRef(0);
  const [, roomFetcherLoad] = useRequest(loadRoomRequest);
  const [createFetcherState, submitCreate] = useMutation(updateRoomCreation);
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
  const activeDiscovery =
    selectedDiscovery ?? (roomType === 'MUSIC' ? discovery : null);
  const providers = activeDiscovery?.providers ?? [];
  const publicRooms = discoveryLoading
    ? []
    : (activeDiscovery?.publicRooms ?? []);

  useEffect(() => {
    let active = true;
    void discoveryFetcherLoad().then((result) => {
      if (!active) return;

      setDiscovery(result.data);
      setInitialError(result.error);
      setInitialized(true);
    });

    return () => {
      active = false;
    };
  }, [discoveryFetcherLoad]);

  const changeRoomType = async (nextType: RoomType) => {
    if (nextType === roomType) return;

    const requestId = ++discoveryRequest.current;
    setRoomType(nextType);
    setSelectedDiscovery(null);
    setRequestError('');
    setDiscoveryLoading(true);
    const result = await discoveryFetcherLoad({
      params: { roomType: nextType },
    });

    if (requestId !== discoveryRequest.current) return;

    setSelectedDiscovery(result.data);
    setRequestError(result.error);
    setDiscoveryLoading(false);
  };

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
      const result = await roomFetcherLoad({
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
    [roomFetcherLoad],
  );

  const refreshRoom = useCallback(async () => {
    if (!roomId || roomLoading) return;

    const requestId = ++roomRequest.current;
    const result = await roomFetcherLoad({ params: { id: roomId } });

    if (requestId !== roomRequest.current) return;

    if (result.error || !result.data) {
      setRequestError(result.error || 'Could not refresh the room.');

      return;
    }

    applyRoomSnapshot(result.data);
    setRequestError('');
  }, [roomFetcherLoad, roomId, roomLoading]);

  useEffect(
    () => subscribeToAppResume(() => void refreshRoom()),
    [refreshRoom],
  );

  const generateRoom = useCallback(
    async (prompt: string) => {
      const result = await submitCreate({
        intent: 'generate',
        prompt,
        roomType,
      });

      if (result.error || !result.data) {
        setRequestError(result.error || 'Could not generate the room.');

        return;
      }

      await loadRoom(result.data.roomId);
    },
    [loadRoom, submitCreate, roomType],
  );

  const createRoom = useCallback(
    async (name: string) => {
      const result = await submitCreate({
        intent: 'create',
        name,
        providers,
        roomType,
      });

      if (result.error || !result.data) {
        setRequestError(result.error || 'Could not create the room.');

        return;
      }

      await loadRoom(result.data.roomId);
    },
    [loadRoom, providers, submitCreate, roomType],
  );

  const leaveRoom = useCallback(() => {
    roomRequest.current += 1;
    setRoomLoading(false);
    setRoomId('');
    setRequestError('');
    useRoomStore.getState().reset();
    useQueueStore.getState().setPlaylistItems([]);
    usePlaybackStore.getState().resetPlaybackState(emptyPlaybackState);
  }, []);

  return [
    {
      error: requestError || initialError || activeDiscovery?.warning || '',
      roomType,
      hydrating: !initialized,
      listenerCount,
      loading: discoveryLoading || roomLoading || createFetcherState,
      playback,
      providers,
      publicRooms,
      room,
      roomId,
      playlistItems,
    },
    { changeRoomType, createRoom, generateRoom, leaveRoom, loadRoom },
  ];
}

const emptyPlaybackState: PlaybackStateV2 = {
  currentPlaylistItem: null,
  isPlaying: false,
  positionMs: 0,
  serverTimeMs: 0,
  updatedAt: '',
};
