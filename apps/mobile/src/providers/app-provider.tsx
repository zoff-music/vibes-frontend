import { getHttpError, useRoomRequests } from '@vibes/api';
import type { PlaybackState, Providers, Room, Song } from '@vibes/models';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface AppState {
  error: string;
  loading: boolean;
  playback: PlaybackState | null;
  providers: Providers;
  refresh: () => Promise<void>;
  room: Room | null;
  roomId: string;
  setError: (message: string) => void;
  setRoomId: (roomId: string, password?: string) => Promise<RoomJoinResult>;
  songs: Song[];
}

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

const AppContext = createContext<AppState | null>(null);
const roomStorageKey = 'zoff.mobile.room';

export function AppProvider({ children }: PropsWithChildren) {
  const roomRequests = useRoomRequests(mobileApi);
  const [roomId, setRoomIdValue] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [providers, setProviders] = useState<Providers>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!roomId) {
      return;
    }

    const [requestError, snapshot] = await roomRequests.fetchSnapshot(roomId);
    if (requestError || !snapshot) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not refresh room.'),
      );
      return;
    }

    setRoom(snapshot.room);
    setSongs(snapshot.songs);
    setPlayback(snapshot.playback);
    setError('');
  }, [roomId, roomRequests]);

  const setRoomId = useCallback(
    async (nextRoomId: string, password = '') => {
      const normalized = nextRoomId.trim().toLowerCase().replace(/\s+/g, '-');
      setLoading(true);
      const [requestError, session] = await roomRequests.joinRoom(
        normalized,
        password,
      );
      setLoading(false);
      if (requestError || !session) {
        const status = requestError
          ? getHttpError(requestError)?.response.status
          : null;
        setError(await getRequestErrorMessage(requestError, 'Room not found'));
        return status === notFoundStatus ? 'notFound' : 'error';
      }

      setRoomIdValue(normalized);
      setRoom(session.room);
      setError('');
      await SecureStore.setItemAsync(roomStorageKey, normalized);
      return 'joined';
    },
    [roomRequests],
  );

  useEffect(() => {
    const loadStoredRoom = async () => {
      const storedRoom = await SecureStore.getItemAsync(roomStorageKey);
      if (storedRoom) {
        await setRoomId(storedRoom);
      }
    };
    void loadStoredRoom();
  }, [setRoomId]);

  useEffect(() => {
    const loadProviders = async () => {
      const [requestError, nextProviders] = await roomRequests.fetchProviders();
      if (requestError || !nextProviders) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not load music providers.',
          ),
        );
        return;
      }
      setProviders(nextProviders);
    };
    void loadProviders();
  }, [roomRequests]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 3_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo<AppState>(
    () => ({
      error,
      loading,
      playback,
      providers,
      refresh,
      room,
      roomId,
      setError,
      setRoomId,
      songs,
    }),
    [
      error,
      loading,
      playback,
      providers,
      refresh,
      room,
      roomId,
      setRoomId,
      songs,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const notFoundStatus = 404;

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
