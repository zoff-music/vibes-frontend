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
  RoomGenerationUpdate,
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
  hasLocalPlaybackChanges: boolean;
  loading: boolean;
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
  observeLocalPlaybackPosition: (positionMs: number) => void;
  leaveRoom: () => Promise<void>;
  playback: PlaybackState | null;
  playbackResetVersion: number;
  playerEnabled: boolean;
  playerPreferenceLoaded: boolean;
  providers: Providers;
  refresh: () => Promise<void>;
  refreshMachineRemote: () => Promise<void>;
  rememberRoomAdminPassword: (
    roomId: string,
    password: string,
  ) => Promise<void>;
  resetLocalPlayback: () => Promise<void>;
  room: Room | null;
  roomId: string;
  setError: (message: string) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  setLocalPlaying: (isPlaying: boolean, positionMs?: number) => void;
  setLocalPlaybackAligned: (isAligned: boolean) => void;
  setLocalPlaybackPosition: (positionMs: number) => void;
  setPlayerEnabled: (enabled: boolean) => Promise<void>;
  setRoomId: (roomId: string, password?: string) => Promise<RoomJoinResult>;
  songs: Song[];
  startGeneratedRoom: (roomId: string) => Promise<RoomJoinResult>;
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
const playerEnabledStorageKey = 'zoff.mobile.player-enabled';
const roomAdminPasswordStoragePrefix = 'zoff.mobile.room-admin';

export function AppProvider({ children }: PropsWithChildren) {
  const roomRequests = useRoomRequests(mobileApi);
  const remoteRequests = useRemoteRequests(mobileApi);
  const [roomId, setRoomIdValue] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [providers, setProviders] = useState<Providers>([]);
  const [playerEnabled, setPlayerEnabledValue] = useState(true);
  const [playerPreferenceLoaded, setPlayerPreferenceLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLocalPlaybackChanges, setHasLocalPlaybackChanges] = useState(false);
  const [playbackResetVersion, setPlaybackResetVersion] = useState(0);
  const [controllerRemote, setControllerRemote] =
    useState<ControllerRemoteSession | null>(null);
  const [machinePairing, setMachinePairing] = useState<RemotePairing | null>(
    null,
  );
  const [machineRemote, setMachineRemote] = useState<RemoteStatus | null>(null);
  const playbackRef = useRef<PlaybackState | null>(null);
  const authoritativePlaybackRef = useRef<PlaybackState | null>(null);
  const localPlayingRef = useRef<boolean | null>(null);
  const pendingGeneratedRoomRef = useRef('');

  const setLocalPlaying = useCallback(
    (isPlaying: boolean, positionMs?: number) => {
      const currentPlayback = playbackRef.current;
      if (!currentPlayback) return;
      localPlayingRef.current = isPlaying;
      setHasLocalPlaybackChanges(
        authoritativePlaybackRef.current?.isPlaying !== isPlaying,
      );
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

  const setLocalPlaybackPosition = useCallback((positionMs: number) => {
    const currentPlayback = playbackRef.current;
    if (!currentPlayback) return;
    const nextPlayback = { ...currentPlayback, positionMs };
    playbackRef.current = nextPlayback;
    setPlayback(nextPlayback);
    setHasLocalPlaybackChanges(true);
  }, []);

  const setLocalPlaybackAligned = useCallback((isAligned: boolean) => {
    const localPlaying = localPlayingRef.current;
    const authoritativePlaying = authoritativePlaybackRef.current?.isPlaying;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritativePlaying;
    setHasLocalPlaybackChanges(!(isAligned && playingIsAligned));
    if (isAligned && playingIsAligned) {
      localPlayingRef.current = null;
    }
  }, []);

  const observeLocalPlaybackPosition = useCallback((positionMs: number) => {
    const authoritativePlayback = authoritativePlaybackRef.current;
    if (!authoritativePlayback) return;
    const authoritativePosition = getObservedPosition(authoritativePlayback);
    const positionIsAligned =
      Math.abs(positionMs - authoritativePosition) <=
      alignedPositionToleranceMs;
    const localPlaying = localPlayingRef.current;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritativePlayback.isPlaying;
    setHasLocalPlaybackChanges(!(positionIsAligned && playingIsAligned));
    if (positionIsAligned && playingIsAligned) {
      localPlayingRef.current = null;
    }
  }, []);

  const setPlayerEnabled = useCallback(async (enabled: boolean) => {
    setPlayerEnabledValue(enabled);
    await SecureStore.setItemAsync(
      playerEnabledStorageKey,
      enabled ? 'true' : 'false',
    );
  }, []);

  const rememberRoomAdminPassword = useCallback(
    async (adminRoomId: string, password: string) => {
      await SecureStore.setItemAsync(
        getRoomAdminPasswordStorageKey(adminRoomId),
        password,
      );
    },
    [],
  );

  const leaveRoom = useCallback(async () => {
    pendingGeneratedRoomRef.current = '';
    setRoomIdValue('');
    setRoom(null);
    setSongs([]);
    setPlayback(null);
    playbackRef.current = null;
    authoritativePlaybackRef.current = null;
    localPlayingRef.current = null;
    setHasLocalPlaybackChanges(false);
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
      pendingGeneratedRoomRef.current = '';
      setRoomIdValue('');
      setRoom(null);
      setSongs([]);
      setPlayback(null);
      playbackRef.current = null;
      authoritativePlaybackRef.current = null;
      localPlayingRef.current = null;
      setHasLocalPlaybackChanges(false);
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
    authoritativePlaybackRef.current = snapshot.playback;
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
      setHasLocalPlaybackChanges(false);
    }
    playbackRef.current = nextPlayback;
    const generationPending = pendingGeneratedRoomRef.current === roomId;
    if (
      generationPending &&
      !snapshot.room.isGenerating &&
      (snapshot.songs.length > 0 || Boolean(snapshot.room.generationError))
    ) {
      pendingGeneratedRoomRef.current = '';
    }
    setRoom(
      pendingGeneratedRoomRef.current === roomId
        ? { ...snapshot.room, isGenerating: true }
        : snapshot.room,
    );
    setSongs(snapshot.songs);
    setPlayback(nextPlayback);
    setError('');
  }, [roomId, roomRequests]);

  const setRoomId = useCallback(
    async (nextRoomId: string, password = '') => {
      const normalized = nextRoomId.trim().toLowerCase().replace(/\s+/g, '-');
      if (
        pendingGeneratedRoomRef.current &&
        pendingGeneratedRoomRef.current !== normalized
      ) {
        pendingGeneratedRoomRef.current = '';
      }
      setLoading(true);
      const storedPassword = await SecureStore.getItemAsync(
        getRoomAdminPasswordStorageKey(normalized),
      );
      const adminPassword = password || storedPassword || '';
      if (adminPassword) {
        const [requestError] = await roomRequests.joinRoom(
          normalized,
          adminPassword,
        );
        if (requestError) {
          if (password) {
            setLoading(false);
            setError(
              await getRequestErrorMessage(
                requestError,
                'Could not authenticate with that admin password.',
              ),
            );
            return 'error';
          }
          await SecureStore.deleteItemAsync(
            getRoomAdminPasswordStorageKey(normalized),
          );
        } else {
          await rememberRoomAdminPassword(normalized, adminPassword);
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
      authoritativePlaybackRef.current = snapshot.playback;
      playbackRef.current = snapshot.playback;
      setHasLocalPlaybackChanges(false);
      setRoom(
        pendingGeneratedRoomRef.current === normalized
          ? { ...snapshot.room, isGenerating: true }
          : snapshot.room,
      );
      setSongs(snapshot.songs);
      setPlayback(snapshot.playback);
      setError('');
      await clearControllerRemote();
      await SecureStore.setItemAsync(roomStorageKey, normalized);
      return 'joined';
    },
    [clearControllerRemote, rememberRoomAdminPassword, roomRequests],
  );

  const startGeneratedRoom = useCallback(
    async (generatedRoomId: string) => {
      const normalized = generatedRoomId
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
      pendingGeneratedRoomRef.current = normalized;
      const result = await setRoomId(normalized);
      if (result !== 'joined') {
        pendingGeneratedRoomRef.current = '';
      }
      return result;
    },
    [setRoomId],
  );

  const resetLocalPlayback = useCallback(async () => {
    if (!roomId) return;
    const [requestError, authoritativePlayback] =
      await roomRequests.fetchPlayback(roomId);
    if (requestError || !authoritativePlayback) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not reset playback position.',
        ),
      );
      return;
    }
    authoritativePlaybackRef.current = authoritativePlayback;
    playbackRef.current = authoritativePlayback;
    localPlayingRef.current = null;
    setPlayback(authoritativePlayback);
    setHasLocalPlaybackChanges(false);
    setPlaybackResetVersion((version) => version + 1);
    setError('');
  }, [roomId, roomRequests]);

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

  const handleGenerationUpdate = useCallback(
    (update: RoomGenerationUpdate) => {
      setRoom((currentRoom) => {
        if (!currentRoom) return currentRoom;
        if (update.status === 'generating') {
          return {
            ...currentRoom,
            generationError: undefined,
            isGenerating: true,
          };
        }
        if (update.status === 'failed') {
          return {
            ...currentRoom,
            generationError:
              update.error ?? 'Playlist generation could not be completed.',
            isGenerating: false,
          };
        }
        return {
          ...currentRoom,
          generationError: undefined,
          isGenerating: false,
        };
      });
      if (update.status !== 'generating') {
        pendingGeneratedRoomRef.current = '';
        void refresh();
      }
    },
    [refresh],
  );

  const roomEventCallbacks = useMemo(
    () => ({
      onGenerationUpdate: handleGenerationUpdate,
      onUsersUpdate: handleUsersUpdate,
    }),
    [handleGenerationUpdate, handleUsersUpdate],
  );

  useSSE(roomId || undefined, roomEventCallbacks, mobileApi);

  useRemoteEvents({
    client: mobileApi,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    ...(machineRemote?.enabled ? { remoteId: machineRemote.id } : {}),
  });

  useEffect(() => {
    const loadPlayerPreference = async () => {
      const storedPreference = await SecureStore.getItemAsync(
        playerEnabledStorageKey,
      );
      if (storedPreference === 'false') {
        setPlayerEnabledValue(false);
      }
      setPlayerPreferenceLoaded(true);
    };
    void loadPlayerPreference();
  }, []);

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
      hasLocalPlaybackChanges,
      disableMachineRemote,
      enableMachineRemote,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      observeLocalPlaybackPosition,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
      providers,
      refresh,
      refreshMachineRemote,
      rememberRoomAdminPassword,
      resetLocalPlayback,
      room,
      roomId,
      setError,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
      setRoomId,
      songs,
      startGeneratedRoom,
    }),
    [
      activateControllerRemote,
      clearControllerRemote,
      controllerRemote,
      error,
      hasLocalPlaybackChanges,
      disableMachineRemote,
      enableMachineRemote,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      observeLocalPlaybackPosition,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
      providers,
      refresh,
      refreshMachineRemote,
      rememberRoomAdminPassword,
      resetLocalPlayback,
      room,
      roomId,
      setRoomId,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
      songs,
      startGeneratedRoom,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const notFoundStatus = 404;

const remoteHeartbeatMs = 5_000;

const remotePairingStatusMs = 2_000;

const alignedPositionToleranceMs = 2_000;

function getRoomAdminPasswordStorageKey(roomId: string) {
  const encodedRoomId = Array.from(roomId, (character) =>
    character.codePointAt(0)?.toString(16),
  ).join('-');
  return `${roomAdminPasswordStoragePrefix}.${encodedRoomId}`;
}

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
