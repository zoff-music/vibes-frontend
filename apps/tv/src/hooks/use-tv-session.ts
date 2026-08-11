import {
  type ApiClient,
  getAPIErrorMessage,
  getHttpError,
  getRateLimitMessage,
  useRoomRequests,
  useSSE,
} from '@vibes/api';
import type {
  PlaybackState,
  Providers,
  PublicRoom,
  Room,
  Song,
} from '@vibes/models';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export function useTvSession(client: ApiClient) {
  const requests = useRoomRequests(client);
  const room = useRoomStore((state) => state.room);
  const listenerCount = useRoomStore((state) => state.usersCount);
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackStore((state) => state.actualPositionMs);
  const serverTimeMs = usePlaybackStore((state) => state.serverTimeMs);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const playback = useMemo(
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
      onUsersUpdate: (count: number) => {
        useRoomStore.getState().setUsersCount(count);
      },
    }),
    [],
  );
  useSSE(roomId || undefined, callbacks, client);

  const applySnapshot = useCallback(
    (snapshot: { playback: PlaybackState; room: Room; songs: Song[] }) => {
      useRoomStore.getState().setRoom(snapshot.room);
      useQueueStore.getState().setSongs(snapshot.songs);
      usePlaybackStore
        .getState()
        .setPlaybackState(snapshot.playback, snapshot.room.mode);
    },
    [],
  );

  const loadRoom = useCallback(
    async (nextRoomId: string): Promise<RoomJoinResult> => {
      const normalizedRoomId = nextRoomId.trim().toLowerCase();
      if (!normalizedRoomId) {
        setError('Enter a room name.');
        return 'error';
      }
      setLoading(true);
      const [requestError, snapshot] =
        await requests.fetchSnapshot(normalizedRoomId);
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
      const [sessionError] = await requests.joinRoom(normalizedRoomId);
      if (sessionError) {
        setError(
          await getRequestErrorMessage(
            sessionError,
            'Could not join that room.',
          ),
        );
        return 'error';
      }
      applySnapshot(snapshot);
      setRoomId(normalizedRoomId);
      setError('');
      return 'joined';
    },
    [applySnapshot, requests],
  );

  const generateRoom = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) {
        setError('Describe the playlist you want.');
        return;
      }
      setLoading(true);
      const [requestError, generatedRoom] = await requests.createGeneratedRoom({
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
    [loadRoom, requests],
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
        await requests.reserveRoom(normalizedName);
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
      const [requestError, createdRoom] = await requests.createRoom({
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
    [loadRoom, providers, requests],
  );

  const leaveRoom = useCallback(() => {
    setRoomId('');
    setError('');
    useRoomStore.getState().reset();
    useQueueStore.getState().setSongs([]);
  }, []);

  useEffect(() => {
    const loadDiscovery = async () => {
      const [[, nextProviders], [, nextPublicRooms]] = await Promise.all([
        requests.fetchProviders(),
        requests.fetchPublicRooms(),
      ]);
      setProviders(nextProviders ?? []);
      setPublicRooms(nextPublicRooms ?? []);
    };
    void loadDiscovery();
  }, [requests]);

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

async function getRequestErrorMessage(error: Error | null, fallback: string) {
  if (!error) return fallback;
  return (
    getRateLimitMessage(error) ?? (await getAPIErrorMessage(error)) ?? fallback
  );
}

const notFoundStatus = 404;
