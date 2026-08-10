import {
  getHttpError,
  useRemoteEvents,
  useRemoteRequests,
  useRoomRequests,
  useSSE,
} from '@vibes/api';
import type {
  PlaybackState,
  Providers,
  RemoteEvent,
  RemotePairing,
  RemoteStatus,
  Room,
  Song,
} from '@vibes/models';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface AppState {
  activateControllerRemote: (
    remoteId: string,
    controllerToken: string,
    roomId: string,
  ) => Promise<void>;
  clearControllerRemote: () => Promise<void>;
  controllerRemote: ControllerRemoteSession | null;
  error: string;
  loading: boolean;
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
  leaveRoom: () => Promise<void>;
  playback: PlaybackState | null;
  providers: Providers;
  refresh: () => Promise<void>;
  refreshMachineRemote: () => Promise<void>;
  room: Room | null;
  roomId: string;
  setError: (message: string) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  setLocalPlaying: (isPlaying: boolean, positionMs?: number) => void;
  setRoomId: (roomId: string, password?: string) => Promise<RoomJoinResult>;
  songs: Song[];
}

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface ControllerRemoteSession {
  controllerToken: string;
  id: string;
  roomId: string;
}

const AppContext = createContext<AppState | null>(null);
const roomStorageKey = 'zoff.mobile.room';
const remoteStorageKey = 'zoff.mobile.remote';
const remoteTokenStorageKey = 'zoff.mobile.remote-token';

export function AppProvider({ children }: PropsWithChildren) {
  const roomRequests = useRoomRequests(mobileApi);
  const remoteRequests = useRemoteRequests(mobileApi);
  const [roomId, setRoomIdValue] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [providers, setProviders] = useState<Providers>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [controllerRemote, setControllerRemote] =
    useState<ControllerRemoteSession | null>(null);
  const [machinePairing, setMachinePairing] = useState<RemotePairing | null>(
    null,
  );
  const [machineRemote, setMachineRemote] = useState<RemoteStatus | null>(null);
  const playbackRef = useRef<PlaybackState | null>(null);
  const localPlayingRef = useRef<boolean | null>(null);

  const setLocalPlaying = useCallback(
    (isPlaying: boolean, positionMs?: number) => {
      const currentPlayback = playbackRef.current;
      if (!currentPlayback) return;
      localPlayingRef.current = isPlaying;
      const nextPlayback = {
        ...currentPlayback,
        isPlaying,
        positionMs: positionMs ?? currentPlayback.positionMs,
      };
      playbackRef.current = nextPlayback;
      setPlayback(nextPlayback);
    },
    [],
  );

  const leaveRoom = useCallback(async () => {
    setRoomIdValue('');
    setRoom(null);
    setSongs([]);
    setPlayback(null);
    playbackRef.current = null;
    localPlayingRef.current = null;
    setError('');
    await SecureStore.deleteItemAsync(roomStorageKey);
  }, []);

  const clearControllerRemote = useCallback(async () => {
    setControllerRemote(null);
    await SecureStore.deleteItemAsync(remoteStorageKey);
    await SecureStore.deleteItemAsync(remoteTokenStorageKey);
  }, []);

  const activateControllerRemote = useCallback(
    async (remoteId: string, controllerToken: string, remoteRoomId: string) => {
      setRoomIdValue('');
      setRoom(null);
      setSongs([]);
      setPlayback(null);
      playbackRef.current = null;
      localPlayingRef.current = null;
      setControllerRemote({
        controllerToken,
        id: remoteId,
        roomId: remoteRoomId,
      });
      setError('');
      await SecureStore.deleteItemAsync(roomStorageKey);
      await SecureStore.setItemAsync(remoteStorageKey, remoteId);
      await SecureStore.setItemAsync(remoteTokenStorageKey, controllerToken);
    },
    [],
  );

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

    const previousPlayback = playbackRef.current;
    const isSameSong =
      previousPlayback?.currentSong?.id === snapshot.playback.currentSong?.id;
    let nextPlayback = snapshot.playback;
    if (snapshot.room.mode === 'server' && localPlayingRef.current !== null) {
      nextPlayback = {
        ...snapshot.playback,
        isPlaying: localPlayingRef.current,
      };
      if (localPlayingRef.current === false && isSameSong && previousPlayback) {
        nextPlayback.positionMs = previousPlayback.positionMs;
      }
    }
    if (snapshot.room.mode === 'host') {
      localPlayingRef.current = null;
    }
    playbackRef.current = nextPlayback;
    setRoom(snapshot.room);
    setSongs(snapshot.songs);
    setPlayback(nextPlayback);
    setError('');
  }, [roomId, roomRequests]);

  const setRoomId = useCallback(
    async (nextRoomId: string, password = '') => {
      const normalized = nextRoomId.trim().toLowerCase().replace(/\s+/g, '-');
      setLoading(true);
      if (password) {
        const [requestError] = await roomRequests.joinRoom(
          normalized,
          password,
        );
        if (requestError) {
          setLoading(false);
          setError(
            await getRequestErrorMessage(
              requestError,
              'Could not authenticate with that admin password.',
            ),
          );
          return 'error';
        }
      }

      const [requestError, snapshot] =
        await roomRequests.fetchSnapshot(normalized);
      setLoading(false);
      if (requestError || !snapshot) {
        const status = requestError
          ? getHttpError(requestError)?.response.status
          : null;
        setError(await getRequestErrorMessage(requestError, 'Room not found'));
        return status === notFoundStatus ? 'notFound' : 'error';
      }
      setRoomIdValue(normalized);
      localPlayingRef.current = null;
      playbackRef.current = snapshot.playback;
      setRoom(snapshot.room);
      setSongs(snapshot.songs);
      setPlayback(snapshot.playback);
      setError('');
      await clearControllerRemote();
      await SecureStore.setItemAsync(roomStorageKey, normalized);
      return 'joined';
    },
    [clearControllerRemote, roomRequests],
  );

  const refreshMachineRemote = useCallback(async () => {
    const [requestError, nextRemote] = await remoteRequests.fetchOwnedRemote();
    if (requestError || !nextRemote) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not load remote control status.',
        ),
      );
      return;
    }
    setMachineRemote(nextRemote);
    if (nextRemote.paired) {
      setMachinePairing(null);
    }
  }, [remoteRequests]);

  const enableMachineRemote = useCallback(async () => {
    const observedPosition = getObservedPosition(playbackRef.current);
    const [requestError, pairing] = await remoteRequests.createRemote({
      currentSongId: playbackRef.current?.currentSong?.id ?? '',
      playbackIsPlaying: playbackRef.current?.isPlaying ?? false,
      playbackPositionMs: observedPosition,
      roomId,
    });
    if (requestError || !pairing) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not enable remote control.',
        ),
      );
      return;
    }
    setMachinePairing(pairing);
    setMachineRemote({
      currentRoomId: pairing.currentRoomId,
      currentSongId: pairing.currentSongId,
      enabled: true,
      id: pairing.id,
      online: true,
      paired: false,
      playbackIsPlaying: pairing.playbackIsPlaying,
      playbackObservedAt: pairing.playbackObservedAt,
      playbackPositionMs: pairing.playbackPositionMs,
    });
    setError('');
  }, [remoteRequests, roomId]);

  const disableMachineRemote = useCallback(async () => {
    if (!machineRemote?.id) return;
    const [requestError] = await remoteRequests.deleteRemote(machineRemote.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not disable remote control.',
        ),
      );
      return;
    }
    setMachinePairing(null);
    setMachineRemote(null);
    setError('');
  }, [machineRemote?.id, remoteRequests]);

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteEvent) => {
      if (event.origin !== 'controller' || !event.roomId) return;
      void setRoomId(event.roomId);
    },
    [setRoomId],
  );

  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEvent) => {
      if (
        event.origin !== 'controller' ||
        event.roomId !== roomId ||
        room?.mode !== 'server'
      ) {
        return;
      }
      const isCurrentSong =
        !event.currentSongId ||
        event.currentSongId === playbackRef.current?.currentSong?.id;
      setLocalPlaying(
        event.playbackIsPlaying,
        isCurrentSong ? event.playbackPositionMs : undefined,
      );
    },
    [room?.mode, roomId, setLocalPlaying],
  );

  const handleUsersUpdate = useCallback((count: number) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return currentRoom;
      return { ...currentRoom, userCount: count };
    });
  }, []);

  const roomEventCallbacks = useMemo(
    () => ({ onUsersUpdate: handleUsersUpdate }),
    [handleUsersUpdate],
  );

  useSSE(roomId || undefined, roomEventCallbacks, mobileApi);

  useRemoteEvents({
    client: mobileApi,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    ...(machineRemote?.enabled ? { remoteId: machineRemote.id } : {}),
  });

  useEffect(() => {
    const loadStoredControllerRemote = async () => {
      const storedRemoteId = await SecureStore.getItemAsync(remoteStorageKey);
      const storedControllerToken = await SecureStore.getItemAsync(
        remoteTokenStorageKey,
      );
      if (!storedRemoteId || !storedControllerToken) return;
      setControllerRemote({
        controllerToken: storedControllerToken,
        id: storedRemoteId,
        roomId: '',
      });
    };
    void loadStoredControllerRemote();
  }, []);

  useEffect(() => {
    const loadStoredRoom = async () => {
      const storedRemoteId = await SecureStore.getItemAsync(remoteStorageKey);
      const storedControllerToken = await SecureStore.getItemAsync(
        remoteTokenStorageKey,
      );
      if (storedRemoteId && storedControllerToken) return;
      const storedRoom = await SecureStore.getItemAsync(roomStorageKey);
      if (storedRoom) {
        const result = await setRoomId(storedRoom);
        if (result !== 'joined') {
          await leaveRoom();
        }
      }
    };
    void loadStoredRoom();
  }, [leaveRoom, setRoomId]);

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
    void refreshMachineRemote();
  }, [refreshMachineRemote]);

  useEffect(() => {
    if (!machineRemote?.enabled) return;
    const heartbeat = async () => {
      const currentPlayback = playbackRef.current;
      const [requestError] = await remoteRequests.updateRemote(
        machineRemote.id,
        {
          currentSongId: currentPlayback?.currentSong?.id ?? '',
          playbackIsPlaying: currentPlayback?.isPlaying ?? false,
          playbackPositionMs: getObservedPosition(currentPlayback),
          roomId,
        },
      );
      if (requestError) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Remote control heartbeat failed.',
          ),
        );
      }
    };
    void heartbeat();
    const interval = setInterval(() => void heartbeat(), remoteHeartbeatMs);
    return () => clearInterval(interval);
  }, [machineRemote?.enabled, machineRemote?.id, remoteRequests, roomId]);

  useEffect(() => {
    if (!machinePairing) return;
    const interval = setInterval(
      () => void refreshMachineRemote(),
      remotePairingStatusMs,
    );
    return () => clearInterval(interval);
  }, [machinePairing, refreshMachineRemote]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 3_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo<AppState>(
    () => ({
      activateControllerRemote,
      clearControllerRemote,
      controllerRemote,
      error,
      disableMachineRemote,
      enableMachineRemote,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      playback,
      providers,
      refresh,
      refreshMachineRemote,
      room,
      roomId,
      setError,
      setLocalPlaying,
      setRoomId,
      songs,
    }),
    [
      activateControllerRemote,
      clearControllerRemote,
      controllerRemote,
      error,
      disableMachineRemote,
      enableMachineRemote,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      playback,
      providers,
      refresh,
      refreshMachineRemote,
      room,
      roomId,
      setRoomId,
      setLocalPlaying,
      songs,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const notFoundStatus = 404;

const remoteHeartbeatMs = 5_000;

const remotePairingStatusMs = 2_000;

function getObservedPosition(playback: PlaybackState | null) {
  if (!playback) return 0;
  if (!playback.isPlaying) return playback.positionMs;
  const elapsed = Math.max(Date.now() - playback.serverTimeMs, 0);
  const duration = (playback.currentSong?.duration ?? 0) * 1_000;
  return Math.min(playback.positionMs + elapsed, duration || Number.MAX_VALUE);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
