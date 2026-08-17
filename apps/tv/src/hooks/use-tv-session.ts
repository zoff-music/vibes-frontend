import {
  type ApiClient,
  createRoomDiscoveryRequests,
  createRoomLifecycleRequests,
  createRoomPlaybackRequests,
  createRoomReadRequests,
  getHttpError,
  getRequestErrorMessage,
  useRoomEvents,
} from '@vibes/api';
import type {
  PlaybackState,
  Providers,
  PublicRoom,
  Room,
  RoomGenerationUpdate,
  Song,
} from '@vibes/models';
import {
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRoomSnapshot } from '@/lib/room-snapshot';

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface TvSession {
  createRoom: (name: string) => Promise<void>;
  error: string;
  generateRoom: (prompt: string) => Promise<void>;
  leaveRoom: () => void;
  listenerCount: number;
  loading: boolean;
  loadRoom: (roomId: string) => Promise<RoomJoinResult>;
  playback: PlaybackState;
  providers: Providers;
  publicRooms: PublicRoom[];
  room: Room | null;
  roomId: string;
  songs: Song[];
}

export type SubscribeToResume = (onResume: () => void) => () => void;

export function useTvSession(
  client: ApiClient,
  subscribeToResume?: SubscribeToResume,
): TvSession {
  const discoveryRequests = useMemo(
    () => createRoomDiscoveryRequests(client),
    [client],
  );
  const lifecycleRequests = useMemo(
    () => createRoomLifecycleRequests(client),
    [client],
  );
  const playbackRequests = useMemo(
    () => createRoomPlaybackRequests(client),
    [client],
  );
  const readRequests = useMemo(() => createRoomReadRequests(client), [client]);
  const room = useRoomStore((state) => state.room);
  const listenerCount = useRoomStore((state) => state.usersCount);
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackStore((state) => state.positionMs);
  const serverTimeMs = usePlaybackStore((state) => state.serverTimeMs);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const playback = useMemo<PlaybackState>(
    () => ({ currentSong, isPlaying, positionMs, serverTimeMs, updatedAt }),
    [currentSong, isPlaying, positionMs, serverTimeMs, updatedAt],
  );
  const [roomId, setRoomId] = useState('');
  const [providers, setProviders] = useState<Providers>([]);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onGenerationUpdate: (update: RoomGenerationUpdate) => {
        const currentRoom = useRoomStore.getState().room;
        if (!currentRoom) return;
        useRoomStore.getState().setRoom({
          ...currentRoom,
          generationError:
            update.status === 'failed'
              ? (update.error ?? 'Playlist generation could not be completed.')
              : undefined,
          isGenerating: update.status === 'generating',
        });
      },
      onHostUpdate: ({ userId }: { userId: string }) => {
        useRoomStore.getState().setHost(userId);
      },
      onPlaybackUpdate: (nextPlayback: PlaybackState) => {
        synchronizeServerClock(nextPlayback.serverTimeMs);
        const roomMode = useRoomStore.getState().room?.mode;
        usePlaybackStore.getState().setPlaybackState(nextPlayback, roomMode);
      },
      onRoomUpdate: (nextRoom: Room) => {
        useRoomStore.getState().setRoom(nextRoom);
      },
      onSongAdded: (song: Song) => {
        useQueueStore.getState().addSong(song);
      },
      onSongsUpdate: (nextSongs: Song[]) => {
        useQueueStore.getState().setSongs(nextSongs);
      },
      onUsersUpdate: (count: number) => {
        useRoomStore.getState().setUsersCount(count);
      },
    }),
    [],
  );
  useRoomEvents(roomId || undefined, callbacks, client);

  const applySnapshot = useCallback(
    (snapshot: { playback: PlaybackState; room: Room; songs: Song[] }) => {
      useRoomStore.getState().setRoom(snapshot.room);
      useQueueStore.getState().setSongs(snapshot.songs);
      synchronizeServerClock(snapshot.playback.serverTimeMs);
      usePlaybackStore
        .getState()
        .resetPlaybackState(snapshot.playback, snapshot.room.mode);
    },
    [],
  );

  const refreshRoom = useCallback(async () => {
    if (!roomId) return;
    const [requestError, snapshot] = await fetchRoomSnapshot(
      roomId,
      readRequests,
      playbackRequests,
    );
    if (requestError || !snapshot) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not refresh the room.',
        ),
      );
      return;
    }

    applySnapshot(snapshot);
    setError('');
  }, [applySnapshot, playbackRequests, readRequests, roomId]);

  useEffect(() => {
    if (!subscribeToResume) return;
    return subscribeToResume(() => {
      void refreshRoom();
    });
  }, [refreshRoom, subscribeToResume]);

  const loadRoom = useCallback(
    async (nextRoomId: string): Promise<RoomJoinResult> => {
      const normalizedRoomId = nextRoomId.trim().toLowerCase();
      if (!normalizedRoomId) {
        setError('Enter a room name.');
        return 'error';
      }
      setLoading(true);
      const [requestError, snapshot] = await fetchRoomSnapshot(
        normalizedRoomId,
        readRequests,
        playbackRequests,
      );
      setLoading(false);
      if (requestError || !snapshot) {
        const status = requestError
          ? getHttpError(requestError)?.response.status
          : null;
        if (status === notFoundStatus) {
          setError('That room does not exist yet.');
          return 'notFound';
        }
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not find that room.',
          ),
        );
        return 'error';
      }
      applySnapshot(snapshot);
      setRoomId(normalizedRoomId);
      setError('');
      return 'joined';
    },
    [applySnapshot, playbackRequests, readRequests],
  );

  const generateRoom = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) {
        setError('Describe the playlist you want.');
        return;
      }
      setLoading(true);
      const [requestError, generatedRoom] =
        await lifecycleRequests.createGeneratedRoom({
          prompt: prompt.trim(),
        });
      if (requestError || !generatedRoom) {
        setLoading(false);
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not start playlist generation.',
          ),
        );
        return;
      }
      await loadRoom(generatedRoom.id);
      setLoading(false);
    },
    [lifecycleRequests, loadRoom],
  );

  const createRoom = useCallback(
    async (name: string) => {
      const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
      if (!normalizedName) {
        setError('Enter a room name.');
        return;
      }
      if (providers.length === 0) {
        setError('Music providers are still loading.');
        return;
      }
      setLoading(true);
      const [reservationError, reservation] =
        await lifecycleRequests.reserveRoom(normalizedName);
      if (reservationError || !reservation) {
        setLoading(false);
        setError(
          await getRequestErrorMessage(
            reservationError,
            'Could not reserve that room name.',
          ),
        );
        return;
      }
      const [requestError, createdRoom] = await lifecycleRequests.createRoom({
        name: normalizedName,
        mode: 'server',
        reservationToken: reservation.token,
        settings: {
          allowDuplicates: false,
          democraticSkip: true,
          enabledSources: providers,
          loopQueue: true,
          maxContinuousAdds: 3,
          onlyAdminAddSongs: false,
          public: false,
          removeOnPlay: false,
          skipAllowed: true,
          skipVoteThreshold: 0.5,
        },
      });
      if (requestError || !createdRoom) {
        setLoading(false);
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not create that room.',
          ),
        );
        return;
      }
      await loadRoom(createdRoom.id);
      setLoading(false);
    },
    [lifecycleRequests, loadRoom, providers],
  );

  const leaveRoom = useCallback(() => {
    setRoomId('');
    setError('');
    useRoomStore.getState().reset();
    useQueueStore.getState().setSongs([]);
    usePlaybackStore.getState().resetPlaybackState(emptyPlaybackState);
  }, []);

  useEffect(() => {
    const loadDiscovery = async () => {
      const [[, nextProviders], [, nextPublicRooms]] = await Promise.all([
        discoveryRequests.fetchProviders(),
        discoveryRequests.fetchPublicRooms(),
      ]);
      setProviders(nextProviders ?? []);
      setPublicRooms(nextPublicRooms ?? []);
    };
    void loadDiscovery();
  }, [discoveryRequests]);

  return {
    createRoom,
    error,
    generateRoom,
    leaveRoom,
    listenerCount,
    loading,
    loadRoom,
    playback,
    providers,
    publicRooms,
    room,
    roomId,
    songs,
  };
}

const notFoundStatus = 404;
const emptyPlaybackState: PlaybackState = {
  currentSong: null,
  isPlaying: false,
  positionMs: 0,
  serverTimeMs: 0,
  updatedAt: '',
};
